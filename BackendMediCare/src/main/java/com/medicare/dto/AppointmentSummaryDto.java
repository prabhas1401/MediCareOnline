package com.medicare.dto;

import java.time.LocalDateTime;

public record AppointmentSummaryDto(
    Long appointmentId,
    String status,
    String specialization,
    LocalDateTime preferredDate,
    LocalDateTime scheduledDateTime,
    Double fee
) {}