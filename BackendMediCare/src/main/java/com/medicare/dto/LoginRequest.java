package com.medicare.dto;

import lombok.Data;

/**
 * Login request expects identifier (email) and password.
 */
@Data
public class LoginRequest {
    private String identifier;
    private String password;
}
