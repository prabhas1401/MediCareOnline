package com.medicare.dto;

import com.medicare.entity.User;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PatientAdminUpdateRequest extends PatientProfileUpdateRequest {
    private User.Status status;
}
