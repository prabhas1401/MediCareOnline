package com.medicare.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.medicare.entity.Appointment;
import com.medicare.repository.AppointmentRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AppointmentAutoCompletionJob {

    private final AppointmentRepository appointmentRepository;

    /**
     * Runs every 5 minutes to auto-complete expired appointments
     */
    @Scheduled(fixedRate = 5 * 60 * 1000) // every 5 minutes
    @Transactional
    public void markExpiredAppointmentsCompleted() {
        LocalDateTime now = LocalDateTime.now();

        // Find all confirmed appointments whose time window has passed
        List<Appointment> expiredAppointments = appointmentRepository
                .findAllByStatusAndScheduledDateTimeBefore(
                        Appointment.AppointmentStatus.CONFIRMED,
                        now.minusMinutes(20) // 20 mins after start
                );

        for (Appointment appt : expiredAppointments) {
            appt.setStatus(Appointment.AppointmentStatus.COMPLETED);
            appointmentRepository.save(appt);
        }

        if (!expiredAppointments.isEmpty()) {
            System.out.println("Auto-completed " + expiredAppointments.size() + " appointments at " + now);
        }
    }
}
