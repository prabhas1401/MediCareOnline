package com.medicare.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class PaymentInitRequest {
    private String specialization;
    private String symptoms;
    private String additionalSymptoms;
    private LocalDate preferredDate;
}