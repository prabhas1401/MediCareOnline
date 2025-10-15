package com.medicare.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;

import lombok.Data;

@Data
public class PaymentSuccessRequest {
    private String orderId;
    private String paymentId;
    private String signature;
    private String method;

    // Appointment fields
    private Doctor.Specialization specialization;
    private List<Appointment.Symptom> symptoms;
    private String additionalSymptoms;
    private LocalDateTime preferredDate;

    public CreateAppointmentRequest toCreateRequest() {
        CreateAppointmentRequest req = new CreateAppointmentRequest();
        req.setSpecialization(this.specialization);
        req.setSymptoms(this.symptoms);
        req.setAdditionalSymptoms(this.additionalSymptoms);
        req.setPreferredDate(this.preferredDate);
        req.setFeePaid(500.0);
        return req;
    }
}
