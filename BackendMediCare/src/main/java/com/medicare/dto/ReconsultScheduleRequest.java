package com.medicare.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Data;

/**
 * Used when the original doctor confirms/schedules a RECONSULT appointment.
 * Only requires requested date/time (no byAdmin flag).
 */
@Data
public class ReconsultScheduleRequest {
    @NotNull
    private LocalDateTime newRequestedDateTime;
}
