package com.medicare.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.medicare.dto.BlockSlotRequest;
import com.medicare.entity.Availability;
import com.medicare.entity.Doctor;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.AvailabilityRepository;
import com.medicare.repository.DoctorLeaveRepository;
import com.medicare.repository.DoctorRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;
	private final AppointmentRepository appointmentRepository;
	private final CalendarService calendarService;

    
    @Transactional
    public Availability blockSlot(Long doctorUserId, BlockSlotRequest req) {
    	
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        LocalDate date = req.getDate();
        LocalTime startTime = req.getStartTime();
        LocalTime endTime = startTime.plusMinutes(20);

        // Validate 20-min boundary
        if (startTime.getMinute() % 20 != 0) {
            throw new ConflictException("Slot must align to a 20-minute boundary.");
        }

        // Validate working hours
        if (!calendarService.isWithinWorkingHours(startTime)) {
            throw new ConflictException("Slot outside working hours or during lunch.");
        }

        // Check appointment conflict
        LocalDateTime slotDateTime = LocalDateTime.of(date, startTime);
        if (appointmentRepository.existsByDoctorUserUserIdAndScheduledDateTime(doctorUserId, slotDateTime)) {
            throw new ConflictException("Cannot block a slot that already has an appointment.");
        }

        // Check already blocked
        boolean exists = availabilityRepository
                .existsByDoctorUserUserIdAndDateAndStartTimeAndBlockedTrue(doctorUserId, date, startTime);
        if (exists) {
            throw new ConflictException("Slot already blocked.");
        }

        // Create availability entry
        Availability slot = new Availability();
        slot.setDoctor(doctor);
        slot.setDate(date);
        slot.setStartTime(startTime);
        slot.setEndTime(endTime);
        slot.setBlocked(true);
        slot.setReason(req.getReason());

        return availabilityRepository.save(slot);
        
    }

}