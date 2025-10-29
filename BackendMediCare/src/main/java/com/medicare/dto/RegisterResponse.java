package com.medicare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Short response returned after registration.
 */
@Data
@AllArgsConstructor
public class RegisterResponse {
    private String email;
    private String status; // INACTIVE / ACTIVE
    private String message;
}
