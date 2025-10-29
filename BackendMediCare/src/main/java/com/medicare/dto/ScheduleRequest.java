package com.medicare.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ScheduleRequest {
    @NotNull
    public Long doctorUserId;
    @NotNull
    public LocalDateTime requestedDateTime;
}
