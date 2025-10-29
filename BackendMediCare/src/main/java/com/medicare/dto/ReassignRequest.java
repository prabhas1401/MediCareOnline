
package com.medicare.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReassignRequest {
    @NotNull
    private Long appointmentId;  // Added: ID of the appointment to reassign

    @NotNull
    private Long newDoctorUserId;

    @NotNull
    private LocalDateTime requestedDateTime;

    private String reason;  // Added: Reason for reassigning (optional, but used in controller)
}