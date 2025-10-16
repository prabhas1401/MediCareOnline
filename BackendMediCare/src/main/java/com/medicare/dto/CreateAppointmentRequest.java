package com.medicare.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAppointmentRequest {
    @NotNull
    public Doctor.Specialization specialization;
    public List<Appointment.Symptom> symptoms;
    public String additionalSymptoms;
    public LocalDateTime preferredDate;
    public Double feePaid;
}