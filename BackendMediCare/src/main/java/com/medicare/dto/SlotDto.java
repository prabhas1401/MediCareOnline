package com.medicare.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SlotDto {
    private LocalDateTime start;
    private String status; // "AVAILABLE" | "BOOKED" | "BLOCKED" | "LEAVE"
    private Long appointmentId; // present only when BOOKED
    private Long availabilityId; // present when BLOCKED (record id)
}
