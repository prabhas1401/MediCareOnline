package com.medicare.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddLeaveRequest {
    @NotNull
    public LocalDate date;
    public String reason;
}
