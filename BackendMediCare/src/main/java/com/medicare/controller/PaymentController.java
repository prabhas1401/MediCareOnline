package com.medicare.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicare.dto.ApiResponse;
import com.medicare.dto.ConfirmRequest;
import com.medicare.dto.CreatePaymentRequest;
import com.medicare.dto.PaymentInitRequest;
import com.medicare.entity.Payment;
import com.medicare.service.PaymentService;
import com.medicare.service.RazorpayService;
import com.razorpay.RazorpayException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * PaymentController
 *
 * - Create payment record for an appointment (controller expects payment was done).
 * - Confirm payment (webhook/admin).
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    
    private final RazorpayService razorpayService;

    @PostMapping("/initiate")
    public ResponseEntity<Map<String, Object>> initiate(@RequestBody PaymentInitRequest req,
                                                        Authentication auth) throws RazorpayException {
        Long patientId = (Long) auth.getPrincipal(); // or session
        Map<String, Object> response = razorpayService.createOrder(patientId, req);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<Payment>> createPayment(@PathVariable Long appointmentId,
                                                 @Valid @RequestBody CreatePaymentRequest req,
                                                 Authentication authentication) {
        // acting user may be patient making the payment; principal used only for audit if needed
        Payment payment = paymentService.createPaymentForAppointment(appointmentId, req.getMethod(), req.getTransactionId());
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Payment created successfully.", payment));
    }

    @PostMapping("/{paymentId}/confirm")
    public ResponseEntity<ApiResponse<Payment>> confirmPayment(@PathVariable Long paymentId,
                                                  @RequestBody ConfirmRequest req) {
        Payment payment = paymentService.confirmPayment(paymentId, req.getStatus());
        return ResponseEntity.ok(new ApiResponse<>(true, "Payment confirmed.", payment));
    }

    @GetMapping("/patient")
    public ResponseEntity<List<Payment>> listByPatient(Authentication authentication) {
        Long patientUserId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(paymentService.getPaymentsByAppointmentPatientUserId(patientUserId));
    }

}