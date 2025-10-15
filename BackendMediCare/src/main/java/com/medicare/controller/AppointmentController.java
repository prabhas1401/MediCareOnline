package com.medicare.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.medicare.dto.ApiResponse;
import com.medicare.dto.CancelRequest;
import com.medicare.dto.CreateAppointmentRequest;
import com.medicare.dto.PaymentSuccessRequest;
import com.medicare.dto.RescheduleRequest;
import com.medicare.dto.ScheduleRequest;
import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;
import com.medicare.entity.Payment;
import com.medicare.service.AppointmentService;
import com.medicare.service.PaymentService;
import com.medicare.service.RazorpayService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * AppointmentController
 *
 * - Patient creates appointment request (PENDING) after paying (frontend handles payment).
 * - Doctors/Admins acquire lock before scheduling/rescheduling/cancelling.
 * - Reconsult creation & scheduling endpoints included.
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final RazorpayService razorpayService;
    private final PaymentService paymentService;

    @PostMapping("/confirm-after-payment")
    public ResponseEntity<ApiResponse<Appointment>> confirmAfterPayment(
            @RequestBody PaymentSuccessRequest req,
            Authentication auth) throws Exception {

        Long patientUserId = (Long) auth.getPrincipal();

        // 1️⃣ Verify payment with Razorpay
        boolean isValid = razorpayService.verifySignature(req.getOrderId(), req.getPaymentId(), req.getSignature());
        if (!isValid) {
            throw new RuntimeException("Payment verification failed");
        }

        // 2️⃣ Create appointment
        Appointment appt = appointmentService.createAppointmentRequest(patientUserId, req.toCreateRequest());
        
        // 3️⃣ Fetch payment method from Razorpay
        String razorpayMethod = razorpayService.getPaymentMethod(req.getPaymentId());
        Payment.Method method = razorpayService.mapRazorpayMethod(razorpayMethod);

        // 4️⃣ Attach Payment Record dynamically
        paymentService.createPaymentForAppointment(
                appt.getAppointmentId(),
                method,
                req.getPaymentId()
        );

        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment created successfully.", appt));
    }



    // ---------- Patient: create appointment request (PENDING) ----------
    @PostMapping("/request")
    public ResponseEntity<ApiResponse<Appointment>> createRequest(@Valid @RequestBody CreateAppointmentRequest req,
                                                     Authentication authentication) {
        Long patientUserId = (Long) authentication.getPrincipal();
        Appointment appointment = appointmentService.createAppointmentRequest(patientUserId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment created successfully.", appointment));
    }


    // ---------- Acquire lock (doctor/admin) ----------
    @PostMapping("/{id}/lock")
    public ResponseEntity<ApiResponse<Appointment>> acquireLock(@PathVariable("id") Long appointmentId,
                                                   Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        Appointment a = appointmentService.acquireLock(appointmentId, actingUserId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment Locked successfully.", a));
    }

    // ---------- Release lock ----------
    @PostMapping("/{id}/unlock")
    public ResponseEntity<?> releaseLock(@PathVariable("id") Long appointmentId,
                                         Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        appointmentService.releaseLock(appointmentId, actingUserId);
        return ResponseEntity.ok("Lock released");
    }

    // ---------- Schedule (assign doctor + slot) ----------
    @PostMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<Appointment>> schedule(@PathVariable("id") Long appointmentId,
                                                @Valid @RequestBody ScheduleRequest req,
                                                Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        Appointment saved = appointmentService.scheduleAppointment(
                appointmentId, actingUserId, req.getDoctorUserId(), req.getAvailabilityId()
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment scheduled successfully.", saved));
    }

    // ---------- Reschedule ----------
    @PostMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<Appointment>> reschedule(@PathVariable("id") Long appointmentId,
                                                  @Valid @RequestBody RescheduleRequest req,
                                                  Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        Appointment saved = appointmentService.rescheduleAppointment(
                appointmentId, actingUserId, req.getNewAvailabilityId(), req.isByAdmin()
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment re-scheduled successfully.", saved));
    }

    // ---------- Cancel ----------
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Appointment>> cancel(@PathVariable("id") Long appointmentId,
                                              @Valid @RequestBody CancelRequest req,
                                              Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        Appointment saved = appointmentService.cancelAppointment(appointmentId, actingUserId, req.isByAdmin(), req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment cancelled successfully.", saved));
    }

    // ---------- Mark completed (doctor only) ----------
    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Appointment>> complete(@PathVariable("id") Long appointmentId,
                                                Authentication authentication) {
        Long doctorUserId = (Long) authentication.getPrincipal();
        Appointment saved = appointmentService.markCompleted(appointmentId, doctorUserId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment marked as completed.", saved));
    }

    // ---------- Reconsult: create (patient) ----------
    @PostMapping("/{originalId}/reconsult")
    public ResponseEntity<ApiResponse<Appointment>> createReconsult(@PathVariable("originalId") Long originalAppointmentId,
                                                       Authentication authentication) {
        Long patientUserId = (Long) authentication.getPrincipal();
        Appointment saved = appointmentService.createReconsult(originalAppointmentId, patientUserId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Re-consult appointment created successfully.", saved));
    }

    // ---------- Reconsult: doctor schedules the reconsult ----------
    @PostMapping("/reconsult/{id}/schedule")
    public ResponseEntity<ApiResponse<Appointment>> scheduleReconsult(@PathVariable("id") Long reconsultId,
                                                         @Valid @RequestBody ScheduleRequest req,
                                                         Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        Appointment saved = appointmentService.scheduleReconsult(reconsultId, req.getDoctorUserId(), req.getAvailabilityId(), actingUserId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Re-consult appointment re-scheduled successfully.", saved));
    }

    // ---------- Finders ----------
    @GetMapping("/pending/{specialization}")
    public ResponseEntity<List<Appointment>> findPendingBySpecialization(@PathVariable String specialization) {
        List<Appointment> list = appointmentService.findPendingBySpecialization(Doctor.Specialization.valueOf(specialization));
        return ResponseEntity.ok(list);
    }

    @GetMapping("/doctor")
    public ResponseEntity<List<Appointment>> findByDoctor(Authentication authentication) {
        Long doctorUserId = (Long) authentication.getPrincipal();
        List<Appointment> appointmentsByDoctor= appointmentService.findByDoctorUserId(doctorUserId);
        return ResponseEntity.ok(appointmentsByDoctor);
    }

    @GetMapping("/patient")
    public ResponseEntity<List<Appointment>> findByPatient(Authentication authentication) {
        Long patientUserId = (Long) authentication.getPrincipal();
        List<Appointment> appointmentsByPatient = appointmentService.findByPatientUserId(patientUserId);
        return ResponseEntity.ok(appointmentsByPatient);
    }

}
