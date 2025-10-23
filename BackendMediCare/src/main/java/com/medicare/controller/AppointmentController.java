package com.medicare.controller;

import java.time.LocalDate;
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
import com.medicare.dto.AppointmentDTO;
import com.medicare.dto.BlockSlotRequest;
import com.medicare.dto.CancelRequest;
import com.medicare.dto.CreateAppointmentRequest;
import com.medicare.dto.PaymentSuccessRequest;
import com.medicare.dto.RescheduleRequest;
import com.medicare.dto.ScheduleRequest;
import com.medicare.dto.SlotDto;
import com.medicare.entity.Appointment;
import com.medicare.entity.Availability;
import com.medicare.entity.Doctor;
import com.medicare.entity.Payment;
import com.medicare.mapper.AppointmentMapper;
import com.medicare.service.AppointmentService;
import com.medicare.service.AvailabilityService;
import com.medicare.service.CalendarService;
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
	private final AvailabilityService availabilityService;
	private final CalendarService calendarService;

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
 
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment request created successfully.", appt));
    }



    // ---------- Patient: create appointment request (PENDING) ----------
    @PostMapping("/request")		//Done
    public ResponseEntity<ApiResponse<AppointmentDTO>> createRequest(@Valid @RequestBody CreateAppointmentRequest req,
                                                     Authentication authentication) {
        Long patientUserId = (Long) authentication.getPrincipal();
        Appointment appointment = appointmentService.createAppointmentRequest(patientUserId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment request created successfully.", AppointmentMapper.toDTO(appointment)));
    }


    // ---------- Acquire lock (doctor/admin) ----------
    @PostMapping("/{id}/lock")			//Done
    public ResponseEntity<ApiResponse<Appointment>> acquireLock(@PathVariable("id") Long appointmentId,
                                                   Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        appointmentService.acquireLock(appointmentId, actingUserId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment Locked successfully.", null));
    }

    // ---------- Release lock ----------
    @PostMapping("/{id}/unlock")		//Done
    public ResponseEntity<ApiResponse<Appointment>> releaseLock(@PathVariable("id") Long appointmentId,
                                         Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        appointmentService.releaseLock(appointmentId, actingUserId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Locked released successfully.", null));
    }

    // ---------- Schedule (assign doctor + slot) ----------
    @PostMapping("/{id}/schedule")			//Done
    public ResponseEntity<ApiResponse<AppointmentDTO>> schedule(@PathVariable("id") Long appointmentId,
                                                @Valid @RequestBody ScheduleRequest req,
                                                Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        Appointment saved = appointmentService.scheduleAppointment(
                appointmentId, actingUserId, req.getDoctorUserId(), req.getRequestedDateTime()
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment scheduled successfully.", AppointmentMapper.toDTO(saved)));
    }
    
    @GetMapping("/doctor/{doctorUserId}/calendar/date/{date}")			//Done
    public ResponseEntity<List<SlotDto>> getCalendarForDoctorOnDate(@PathVariable Long doctorUserId, @PathVariable String date) {
        LocalDate d = LocalDate.parse(date);
        List<SlotDto> slots = calendarService.getSlotsForDoctorAndDate(doctorUserId, d);
        return ResponseEntity.ok(slots);
    }

    @PostMapping("/doctor/availability/block")		//Done	
    public ResponseEntity<ApiResponse<Availability>> blockSlot(@Valid @RequestBody BlockSlotRequest req,
                                                               Authentication authentication) {
        Long doctorUserId = (Long) authentication.getPrincipal();

        availabilityService.blockSlot(doctorUserId, req);
        
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Slot blocked successfully", null));
    }


    // ---------- Reschedule ----------
    @PostMapping("/{id}/reschedule")			//Done
    public ResponseEntity<ApiResponse<AppointmentDTO>> reschedule(@PathVariable("id") Long appointmentId,
                                                  @Valid @RequestBody RescheduleRequest req,
                                                  Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        Appointment saved = appointmentService.rescheduleAppointment(
                appointmentId, actingUserId, req.newRequestedDateTime, req.isByAdmin()
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment re-scheduled successfully.", AppointmentMapper.toDTO(saved)));
    }

    // ---------- Cancel ----------
    @PostMapping("/{id}/cancel")			//Done
    public ResponseEntity<ApiResponse<AppointmentDTO>> cancel(@PathVariable("id") Long appointmentId,
                                              @Valid @RequestBody CancelRequest req,
                                              Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        Appointment saved = appointmentService.cancelAppointment(appointmentId, actingUserId, req.isByAdmin(), req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment cancelled successfully.", AppointmentMapper.toDTO(saved)));
    }

    // ---------- Reconsult: create (patient) ----------
    @PostMapping("/{originalId}/reconsult")				//Done
    public ResponseEntity<ApiResponse<AppointmentDTO>> createReconsult(@PathVariable("originalId") Long originalAppointmentId,
                                                       Authentication authentication) {
        Long patientUserId = (Long) authentication.getPrincipal();
        Appointment saved = appointmentService.createReconsult(originalAppointmentId, patientUserId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Re-consult appointment created successfully.", AppointmentMapper.toDTO(saved)));
    }

    // ---------- Finders ----------
    @GetMapping("/pending/{specialization}")		//Done		
    public ResponseEntity<List<AppointmentDTO>> findPendingBySpecialization(@PathVariable String specialization) {
        List<AppointmentDTO> list = appointmentService.findPendingBySpecialization(Doctor.Specialization.valueOf(specialization))
        		.stream()
        		.map(AppointmentMapper::toDTO)
        		.toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/doctor")				//Done
    public ResponseEntity<List<AppointmentDTO>> findAllByDoctor(Authentication authentication) {
        Long doctorUserId = (Long) authentication.getPrincipal();
        List<AppointmentDTO> appointmentsByDoctor= appointmentService.findByDoctorUserId(doctorUserId)
        		.stream()
                .map(AppointmentMapper::toDTO)
        		.toList();
        return ResponseEntity.ok(appointmentsByDoctor);
    }

    @GetMapping("/patient")				//Done
    public ResponseEntity<List<AppointmentDTO>> findAllByPatient(Authentication authentication) {
        Long patientUserId = (Long) authentication.getPrincipal();
        List<AppointmentDTO> appointmentsByPatient = appointmentService.findByPatientUserId(patientUserId)
                .stream()
                .map(AppointmentMapper::toDTO)
                .toList();
        return ResponseEntity.ok(appointmentsByPatient);
    }
    
    @GetMapping("/{id}")			//Done
    public ResponseEntity<AppointmentDTO> findByDoctor(@PathVariable("id") Long appointmentId, Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        Appointment appointment= appointmentService.findByAppointmentId(appointmentId, actingUserId);
        return ResponseEntity.ok(AppointmentMapper.toDTO(appointment));
    }
    
    @GetMapping("/doctor/reconsults")		//Done
    public ResponseEntity<List<AppointmentDTO>> findReconsultsByDoctor(Authentication authentication) {
        Long doctorUserId = (Long) authentication.getPrincipal();
        
        List<AppointmentDTO> list = appointmentService.findByDoctorReconsults(doctorUserId)
        		.stream()
        		.map(AppointmentMapper::toDTO)
        		.toList();
        return ResponseEntity.ok(list);
    }

}
