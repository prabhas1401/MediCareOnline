package com.medicare.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RescheduleRequest {
    @NotNull
    public LocalDateTime newRequestedDateTime;
    public boolean byAdmin = false; // admin may bypass 1-day rule by setting true
}