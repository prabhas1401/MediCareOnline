package com.medicare.dto;

import com.medicare.entity.Doctor;

import lombok.Data;

@Data
public class DoctorSummaryDTO {
    private Long userId;
    private String fullName;
    private String emailId;
    private String phoneNumber;
    private Doctor.Specialization specialization;
    private String qualification;
    private int experienceYears;
}