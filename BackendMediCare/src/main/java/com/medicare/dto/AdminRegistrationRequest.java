package com.medicare.dto;

import lombok.Data;

/**
 * Payload to create an admin user (only by existing super-admin).
 * The controller should ensure 'performedByAdminUserId' is the id of the admin performing the action.
 */
@Data
public class AdminRegistrationRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String rawPassword;
    private boolean superAdmin;
}
