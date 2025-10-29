package com.medicare.mapper;

import com.medicare.dto.PatientDTO;
import com.medicare.entity.Patient;

public class MapPatient {
    public static PatientDTO toDTO(Patient patient) {
        return new PatientDTO(
        		patient.getUser().getUserId(),
        		patient.getUser().getFullName(),
        		patient.getUser().getEmailId(),
        		patient.getUser().getPhoneNumber(),
        		patient.getUser().getStatus(),
        		patient.getUser().getCreatedAt(),
                patient.getUser().getUpdatedAt(),
                patient.getGender().name(),
                patient.getDateOfBirth().toString()
        );
    }
}
