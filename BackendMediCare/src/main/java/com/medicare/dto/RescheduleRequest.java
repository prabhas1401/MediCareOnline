
package com.medicare.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RescheduleRequest {
    @NotNull
    private Long appointmentId;  // Added: ID of the appointment to reschedule

    @NotNull
    private LocalDateTime newRequestedDateTime;

    private String reason;  // Added: Reason for rescheduling (optional, but used in controller)

    private boolean byAdmin = false;  // Admin may bypass 1-day rule by setting true
}