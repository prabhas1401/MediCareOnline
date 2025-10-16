package com.medicare.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ScheduleRequest {
    @NotNull
    public Long doctorUserId;
    @NotNull
    public Long availabilityId;
}
