package com.medicare.dto;

import com.medicare.entity.User;

import lombok.Data;

@Data
public class DoctorProfileUpdateRequest {
    private String fullName;
    private String emailId;
    private String phoneNumber;
    private String rawPassword;
    private String qualification;
    private int experienceYears;
    private String specialization;
    private User.Status status;
}
