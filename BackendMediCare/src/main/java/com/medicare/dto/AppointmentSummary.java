package com.medicare.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;

import lombok.Data;

@Data
public class AppointmentSummary {
    private Long appointmentId;
    private PatientSummaryDTO patient;
    private DoctorSummaryDTO doctor;
    private String status;
    private Doctor.Specialization specialization;
    private List<Appointment.Symptom> symptoms;
    private String additionalSymptoms;
    private LocalDateTime preferredDate;
    private LocalDateTime scheduledDateTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean reconsult;
}
