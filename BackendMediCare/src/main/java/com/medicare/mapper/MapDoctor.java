package com.medicare.mapper;

import com.medicare.dto.DoctorDTO;
import com.medicare.entity.Doctor;

public class MapDoctor {
    public static DoctorDTO toDTO(Doctor doctor) {
        return new DoctorDTO(
                doctor.getUser().getUserId(),
                doctor.getUser().getFullName(),
                doctor.getUser().getEmailId(),
                doctor.getUser().getPhoneNumber(),
                doctor.getUser().getStatus(),
                doctor.getUser().getCreatedAt(),
                doctor.getUser().getUpdatedAt(),
                doctor.getSpecialization().name(),
                doctor.getQualification(),
                doctor.getExperienceYears()
        );
    }
}
