package com.medicare.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CancelledAppointmentDTO {
    private Long id;
    private AppointmentSummaryForCancelDTO appointment;
    private DoctorShortDTO cancelledByDoctor;
    private String reason;
    private LocalDateTime cancelledAt;
}
