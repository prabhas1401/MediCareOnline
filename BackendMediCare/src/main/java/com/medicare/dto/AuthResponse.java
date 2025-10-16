package com.medicare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Authentication response containing JWT token and user meta.
 */
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role;
    private Long userId;
    private String fullName;
}
