package com.medicare.dto;

import lombok.Data;

@Data
public class PatientProfileUpdateRequest {
    private String fullName;
    private String emailId;
    private String phoneNumber;
    private String rawPassword;
}
