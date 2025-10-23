package com.medicare.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReassignRequest {
    @NotNull
    private Long newDoctorUserId;

    @NotNull
    private LocalDateTime requestedDateTime;
}
