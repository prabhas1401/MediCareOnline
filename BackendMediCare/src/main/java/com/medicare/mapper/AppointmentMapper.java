package com.medicare.mapper;

import java.util.Collections;
import java.util.Optional;

import com.medicare.dto.AppointmentDTO;
import com.medicare.entity.Appointment;

public class AppointmentMapper {

    public static AppointmentDTO toDTO(Appointment appt) {
        return new AppointmentDTO(
            appt.getAppointmentId(),
            appt.getStatus().name(),
            appt.getSpecialization().name(),
            Optional.ofNullable(appt.getSymptoms())
            .orElse(Collections.emptyList())
            .stream()
            .map(Enum::name)
            .toList(),            
            appt.getAdditionalSymptoms(),
            appt.getPreferredDate(),
            appt.getScheduledDateTime(),
            appt.getCreatedAt(),
            appt.getUpdatedAt(),
            appt.getFee(),
            appt.getPrescription() != null ? appt.getPrescription().getPrescriptionId() : null,
            appt.getMeetingLink(),
            appt.isReconsult(),
            appt.getOriginalAppointment() != null ? appt.getOriginalAppointment().getAppointmentId() : null,
            new AppointmentDTO.PatientInfo(
                appt.getPatient().getUser().getUserId(),
                appt.getPatient().getUser().getFullName(),
                appt.getPatient().getUser().getEmailId(),
                appt.getPatient().getUser().getPhoneNumber(),
                appt.getPatient().getGender().name(),
                appt.getPatient().getDateOfBirth()
            ),
            appt.getDoctor() != null ? new AppointmentDTO.DoctorInfo(
                appt.getDoctor().getUser().getUserId(),
                appt.getDoctor().getUser().getFullName(),
                appt.getDoctor().getUser().getPhoneNumber(),
                appt.getDoctor().getSpecialization().name()
            ) : null
        );
    }
}
