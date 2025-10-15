package com.medicare.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.medicare.entity.Appointment;
import com.medicare.entity.Payment;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.PaymentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;

    @Value("${medicare.consultation.fee:500.0}")
    private Double consultationFee;

    /**
     * Create a payment record for an appointment.
     * - For main appointments amount = consultationFee
     * - For reconsults amount = 0.0
     * Returns saved Payment.
     */
    @Transactional
    public Payment createPaymentForAppointment(Long appointmentId, Payment.Method method, String transactionId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        Payment p = new Payment();
        p.setAppointment(appt);
        // Determine amount: if reconsult -> 0
        p.setAmount(Boolean.TRUE.equals(appt.isReconsult()) ? 0.0 : consultationFee);
        p.setMethod(method);
        p.setTransactionId(transactionId);
        p.setStatus(Payment.Status.PENDING);
        p.setPaymentDate(LocalDateTime.now());
        return paymentRepository.save(p);
    }

    @Transactional
    public Payment confirmPayment(Long paymentId, Payment.Status status) {
        Payment p = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        p.setStatus(status);
        return paymentRepository.save(p);
    }

    public List<Payment> getPaymentsByAppointmentPatientUserId(Long patientUserId) {
        return paymentRepository.findByAppointmentPatientUserUserId(patientUserId);
    }

    public List<Payment> getPaymentsByStatus(Payment.Status status) {
        return paymentRepository.findByStatus(status);
    }
}