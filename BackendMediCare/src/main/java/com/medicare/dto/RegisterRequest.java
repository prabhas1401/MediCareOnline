package com.medicare.dto;

import lombok.Data;

/**
 * Registration payload used for Patient and Doctor self-registration.
 * For doctor, include specialization/qualification/experience as needed in controller mapping.
 */
@Data
public class RegisterRequest {
    private String fullName;
    private String emailId;
    private String phoneNumber;
    private String rawPassword;

    // Doctor-specific fields (optional)
    private String specialization;
    private String qualification;
    private Integer experienceYears;
}

