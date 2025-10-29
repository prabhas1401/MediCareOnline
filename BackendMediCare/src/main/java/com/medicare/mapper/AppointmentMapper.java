
package com.medicare.mapper;

import java.util.Collections;
import java.util.Optional;

import com.medicare.dto.AppointmentDTO;
import com.medicare.entity.Appointment;

public class AppointmentMapper {

    public static AppointmentDTO toDTO(Appointment appt) {
        if (appt == null) {
            return null;
        }

        // Null-safe handling for patient
        AppointmentDTO.PatientInfo patientInfo = null;
        if (appt.getPatient() != null && appt.getPatient().getUser() != null) {
            patientInfo = new AppointmentDTO.PatientInfo(
                appt.getPatient().getUser().getUserId(),
                appt.getPatient().getUser().getFullName(),
                appt.getPatient().getUser().getEmailId(),
                appt.getPatient().getUser().getPhoneNumber(),
                appt.getPatient().getGender() != null ? appt.getPatient().getGender().name() : null,
                appt.getPatient().getDateOfBirth()
            );
        }

        // Null-safe handling for doctor
        AppointmentDTO.DoctorInfo doctorInfo = null;
        if (appt.getDoctor() != null && appt.getDoctor().getUser() != null) {
            doctorInfo = new AppointmentDTO.DoctorInfo(
                appt.getDoctor().getUser().getUserId(),
                appt.getDoctor().getUser().getFullName(),
                appt.getDoctor().getUser().getPhoneNumber(),
                appt.getDoctor().getSpecialization() != null ? appt.getDoctor().getSpecialization().name() : null
            );
        }
     


        return new AppointmentDTO(
            appt.getAppointmentId(),
            appt.getStatus() != null ? appt.getStatus().name() : null,
            appt.getSpecialization() != null ? appt.getSpecialization().name() : null,
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
            patientInfo,  // Now null-safe
            doctorInfo    // Now null-safe
        );
    }
}