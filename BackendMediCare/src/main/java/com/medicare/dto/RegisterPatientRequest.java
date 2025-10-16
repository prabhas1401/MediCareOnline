package com.medicare.dto;

import java.time.LocalDate;

import com.medicare.entity.Patient;

import lombok.Data;

@Data
public class RegisterPatientRequest {
    private String fullName;
    private String emailId;
    private String phoneNumber;
    private String rawPassword;
    private Patient.Gender gender;
    private LocalDate dateOfBirth;
}
