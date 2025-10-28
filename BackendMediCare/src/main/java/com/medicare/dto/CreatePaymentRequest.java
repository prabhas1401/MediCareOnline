package com.medicare.dto;

import com.medicare.entity.Payment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePaymentRequest {
    @NotNull
    public Payment.Method method;
    public String transactionId;
}

