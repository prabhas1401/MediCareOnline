package com.medicare.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.medicare.dto.DayStatus;
import com.medicare.dto.DaySummaryDto;
import com.medicare.dto.SlotDto;
import com.medicare.entity.Appointment;
import com.medicare.entity.Availability;
import com.medicare.entity.Doctor;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.AvailabilityRepository;
import com.medicare.repository.DoctorLeaveRepository;
import com.medicare.repository.DoctorRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final DoctorRepository doctorRepository;
    private final DoctorLeaveRepository doctorLeaveRepository;
    private final AppointmentRepository appointmentRepository;
    private final AvailabilityRepository availabilityRepository;

    // Global working hours & slot config (shared)
    private static final LocalTime WORK_START = LocalTime.of(9, 0);
    private static final LocalTime WORK_END = LocalTime.of(17, 0);
    private static final Duration SLOT_DURATION = Duration.ofMinutes(20);
    private static final LocalTime LUNCH_START = LocalTime.of(12, 0);
    private static final LocalTime LUNCH_END = LocalTime.of(13, 0);

    /**
     * Generate slots for a given doctor & date. Each slot returned with status:
     * AVAILABLE, BOOKED, BLOCKED, or LEAVE.
     */
    public List<SlotDto> getSlotsForDoctorAndDate(Long doctorUserId, LocalDate date) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new com.medicare.exception.ResourceNotFoundException("Doctor not found"));

        // 1) If doctor is on leave -> return a single LEAVE record or empty list
        if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(doctorUserId, date)) {
            // optionally return empty list — clients can treat as all day leave
            SlotDto leave = new SlotDto(date.atStartOfDay(), "LEAVE", null, null);
            return List.of(leave);
        }

        // 2) Load existing appointments for that date to identify booked slots
        LocalDateTime dayStart = LocalDateTime.of(date, LocalTime.MIN);
        LocalDateTime dayEnd = LocalDateTime.of(date, LocalTime.MAX);
        List<Appointment> bookedAppts = appointmentRepository
                .findByDoctorUserUserIdAndScheduledDateTimeBetween(doctorUserId, LocalDateTime.of(date, WORK_START), LocalDateTime.of(date, WORK_END));

        Map<LocalDateTime, Appointment> bookedMap = bookedAppts.stream()
                .filter(a -> a.getScheduledDateTime() != null)
                .collect(Collectors.toMap(Appointment::getScheduledDateTime, a -> a));

        // 3) Load blocked slots for that day
        List<Availability> blockedSlots = availabilityRepository.findByDoctorUserUserIdAndBlockedTrueAndDate(doctorUserId, date);
        Map<LocalTime, Availability> blockedMap = blockedSlots.stream()
                .collect(Collectors.toMap(Availability::getStartTime, s -> s));

        // 4) Generate time slots
        List<SlotDto> slots = new ArrayList<>();
        LocalTime t = WORK_START;
        while (!t.isAfter(WORK_END.minus(SLOT_DURATION))) {

            // skip lunch range
            if (!t.isBefore(LUNCH_START) && t.isBefore(LUNCH_END)) {
                t = LUNCH_END; // jump over lunch block
                continue;
            }

            LocalDateTime slotDateTime = LocalDateTime.of(date, t);

            if (bookedMap.containsKey(slotDateTime)) {
                Appointment a = bookedMap.get(slotDateTime);
                slots.add(new SlotDto(slotDateTime, "BOOKED", a.getAppointmentId(), null));
            } else if (blockedMap.containsKey(t)) {
                Availability av = blockedMap.get(t);
                slots.add(new SlotDto(slotDateTime, "BLOCKED", null, av.getAvailabilityId()));
            } else {
                slots.add(new SlotDto(slotDateTime, "AVAILABLE", null, null));
            }

            t = t.plus(SLOT_DURATION);
        }

        return slots;
    }
    
    public boolean isWithinWorkingHours(LocalTime t) {
        if (t.isBefore(WORK_START) || t.isAfter(WORK_END.minus(SLOT_DURATION))) return false;
        if (!t.isBefore(LUNCH_START) && t.isBefore(LUNCH_END)) return false;
        return (t.getMinute() % 20 == 0);
    }
    
    /**
     * Month summary: returns a DaySummaryDto for each day of the requested month.
     */
    public List<DaySummaryDto> getMonthSummary(Long doctorUserId, YearMonth ym) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new com.medicare.exception.ResourceNotFoundException("Doctor not found"));

        List<DaySummaryDto> out = new ArrayList<>();

        int days = ym.lengthOfMonth();
        for (int d = 1; d <= days; d++) {
            LocalDate date = ym.atDay(d);

            // 1) Leave check
            if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(doctorUserId, date)) {
                out.add(new DaySummaryDto(date, DayStatus.LEAVE, 0, 0, 0, 0));
                continue;
            }

            // 2) Build slot counters
            // Compute total slots for the day (derived from working hours excluding lunch)
            int totalSlots = calculateTotalSlotsPerDay();

            // fetch booked appointments for day (only within working hours)
            List<Appointment> bookedAppts = appointmentRepository.findByDoctorUserUserIdAndScheduledDateTimeBetween(
                    doctorUserId,
                    LocalDateTime.of(date, WORK_START),
                    LocalDateTime.of(date, WORK_END)
            );

            // fetch blocked availabilities for day
            List<Availability> blockedSlots = availabilityRepository.findByDoctorUserUserIdAndBlockedTrueAndDate(doctorUserId, date);

            // compute counts:
            // Some of bookedAppts might be outside slot boundaries (shouldn't happen) — assume valid.
            int bookedCount = (int) bookedAppts.stream()
                    .filter(a -> a.getScheduledDateTime() != null
                            && isWithinWorkingHours(a.getScheduledDateTime().toLocalTime()))
                    .count();

            int blockedCount = (int) blockedSlots.stream()
                    .filter(s -> isWithinWorkingHours(s.getStartTime()))
                    .count();

            int availableCount = totalSlots - bookedCount - blockedCount;
            if (availableCount < 0) availableCount = 0; // safety

            DayStatus status;
            if (availableCount > 0) status = DayStatus.AVAILABLE;
            else if (bookedCount > 0 || blockedCount > 0) status = DayStatus.NOT_AVAILABLE;
            else status = DayStatus.AVAILABLE; // default rule: no data => AVAILABLE

            out.add(new DaySummaryDto(date, status, totalSlots, availableCount, bookedCount, blockedCount));
        }

        return out;
    }
    
    private int calculateTotalSlotsPerDay() {
        // total working minutes excluding lunch: (WORK_START..WORK_END) minus lunch
        int morningMinutes = (int) Duration.between(WORK_START, LUNCH_START).toMinutes(); // 9:00-12:00 = 180
        int afternoonMinutes = (int) Duration.between(LUNCH_END, WORK_END).toMinutes(); // 13:00-17:00 = 240
        int total = morningMinutes + afternoonMinutes; // 420
        return total / (int)SLOT_DURATION.toMinutes(); // 420 / 20 = 21 slots
    }
}
