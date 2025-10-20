package com.example.hms.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO class for user registration requests.
 * Modified to match frontend field names.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    // Used for frontend validation (not persisted)
    private String confirmPassword;

    // Common fields
    private String role; // doctor / patient
    private String phone;

    // Doctor-specific fields
    private String qualification;
    private String experience;
    private String specialization;

    // Patient-specific fields
    private String dob;
    private String mobile;
    private String gender;
}
