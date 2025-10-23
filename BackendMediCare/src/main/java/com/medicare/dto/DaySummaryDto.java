package com.medicare.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DaySummaryDto {
    private LocalDate date;
    private DayStatus status;
    private int totalSlots;       // total slots in working day (excluding lunch)
    private int availableSlots;
    private int bookedSlots;
    private int blockedSlots;
}
