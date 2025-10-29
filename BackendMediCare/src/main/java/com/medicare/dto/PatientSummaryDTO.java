package com.medicare.dto;

import lombok.Data;

@Data
public class PatientSummaryDTO {
    private Long userId;
    private String fullName;
    private String emailId;
    private String phoneNumber;
    private String gender;
    private String dateOfBirth;
}