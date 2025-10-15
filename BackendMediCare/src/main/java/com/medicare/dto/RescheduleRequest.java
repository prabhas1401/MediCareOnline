package com.medicare.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RescheduleRequest {
    @NotNull
    public Long newAvailabilityId;
    public boolean byAdmin = false; // admin may bypass 1-day rule by setting true
}