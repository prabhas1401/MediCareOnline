package com.medicare.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BlockSlotRequest {
    @NotNull
    private LocalDate date;
    @NotNull
    private LocalTime startTime;
    private String reason;
}
