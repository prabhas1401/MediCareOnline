package com.medicare.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicare.dto.ApiResponse;
import com.medicare.dto.AppointmentDTO;
import com.medicare.dto.BlockSlotRequest;
import com.medicare.dto.CancelRequest;
import com.medicare.dto.CreateAppointmentRequest;
import com.medicare.dto.PaymentSuccessRequest;
import com.medicare.dto.ReassignRequest;
import com.medicare.dto.RescheduleRequest;
import com.medicare.dto.ScheduleRequest;
import com.medicare.dto.SlotDto;
import com.medicare.entity.Appointment;
import com.medicare.entity.Availability;
import com.medicare.entity.Payment;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.mapper.AppointmentMapper;
import com.medicare.repository.AppointmentRepository;
import com.medicare.service.AppointmentService;
import com.medicare.service.AvailabilityService;
import com.medicare.service.CalendarService;
import com.medicare.service.PaymentService;
import com.medicare.service.RazorpayService;
import com.medicare.util.JwtUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
@Slf4j
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final RazorpayService razorpayService;
    private final PaymentService paymentService;
    private final AvailabilityService availabilityService;
    private final CalendarService calendarService;
    private final JwtUtil jwtUtil;
    private final AppointmentRepository appointmentRepository;


    @PostMapping("/confirm-after-payment")
    public ResponseEntity<ApiResponse<AppointmentDTO>> confirmAfterPayment(
            @RequestBody PaymentSuccessRequest req,
            Authentication auth) {
        try {
            log.info("Confirming appointment after payment for orderId: {}", req.getOrderId());

            Long patientUserId = (Long) auth.getPrincipal();
            if (patientUserId == null) {
                log.error("Patient user ID is null");
                return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthorized", null));
            }
            log.debug("Extracted patientUserId: {}", patientUserId);

            boolean isValid = razorpayService.verifySignature(req.getOrderId(), req.getPaymentId(), req.getSignature());
            if (!isValid) {
                log.error("Payment verification failed for orderId: {}", req.getOrderId());
                return ResponseEntity.status(400).body(new ApiResponse<>(false, "Payment verification failed", null));
            }

            Appointment appt = appointmentService.createAppointmentRequest(patientUserId, req.toCreateRequest());
            log.info("Appointment created: {}", appt.getAppointmentId());

            String razorpayMethod = razorpayService.getPaymentMethod(req.getPaymentId());
            Payment.Method method = razorpayService.mapRazorpayMethod(razorpayMethod);

            paymentService.createPaymentForAppointment(
                    appt.getAppointmentId(),
                    method,
                    req.getPaymentId()
            );

            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment confirmed successfully.", AppointmentMapper.toDTO(appt)));
        } catch (Exception e) {
            log.error("Error confirming appointment after payment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "An unexpected error occurred. Please contact support.", null));
        }
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<AppointmentDTO>> createRequest(@Valid @RequestBody CreateAppointmentRequest req,
                                                                     Authentication authentication) {
        try {
            Long patientUserId = (Long) authentication.getPrincipal();
            Appointment appointment = appointmentService.createAppointmentRequest(patientUserId, req);
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment request created successfully.", AppointmentMapper.toDTO(appointment)));
        } catch (Exception e) {
            log.error("Error creating appointment request: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Error creating request", null));
        }
    }

    @PostMapping("/{id}/lock")
    public ResponseEntity<ApiResponse<Appointment>> acquireLock(@PathVariable("id") Long appointmentId,
                                                                Authentication authentication) {
        try {
            Long actingUserId = (Long) authentication.getPrincipal();
            appointmentService.acquireLock(appointmentId, actingUserId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment Locked successfully.", null));
        } catch (Exception e) {
            log.error("Error acquiring lock: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Error locking appointment", null));
        }
    }

    @PutMapping("/{id}/start-visit")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Appointment> startVisit(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        try {
            Long doctorUserId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
            Appointment appointment = appointmentService.startVisit(id, doctorUserId);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            log.error("Error starting visit: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<ApiResponse<Appointment>> releaseLock(@PathVariable("id") Long appointmentId,
                                                                Authentication authentication) {
        try {
            Long actingUserId = (Long) authentication.getPrincipal();
            appointmentService.releaseLock(appointmentId, actingUserId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lock released successfully.", null));
        } catch (Exception e) {
            log.error("Error releasing lock: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Error releasing lock", null));
        }
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<AppointmentDTO>> schedule(@PathVariable("id") Long appointmentId,
                                                                @Valid @RequestBody ScheduleRequest req,
                                                                Authentication authentication) {
        try {
            Long actingUserId = (Long) authentication.getPrincipal();
            Appointment saved = appointmentService.scheduleAppointment(
                    appointmentId, actingUserId, req.getDoctorUserId(), req.getRequestedDateTime()
            );
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment scheduled successfully.", AppointmentMapper.toDTO(saved)));
        } catch (Exception e) {
            log.error("Error scheduling appointment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Error scheduling", null));
        }
    }

    @GetMapping("/doctor/{doctorUserId}/calendar/date/{date}")
    public ResponseEntity<List<SlotDto>> getCalendarForDoctorOnDate(@PathVariable Long doctorUserId, @PathVariable String date) {
        try {
            LocalDate d = LocalDate.parse(date);
            List<SlotDto> slots = calendarService.getSlotsForDoctorAndDate(doctorUserId, d);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            log.error("Error fetching calendar: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(List.of());
        }
    }

    @PostMapping("/doctor/availability/block")
    public ResponseEntity<ApiResponse<Availability>> blockSlot(@Valid @RequestBody BlockSlotRequest req,
                                                               Authentication authentication) {
        try {
            Long doctorUserId = (Long) authentication.getPrincipal();
            availabilityService.blockSlot(doctorUserId, req);
            return ResponseEntity.status(201).body(new ApiResponse<>(true, "Slot blocked successfully", null));
        } catch (Exception e) {
            log.error("Error blocking slot: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Error blocking slot", null));
        }
    }

    @PostMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentDTO>> reschedule(@PathVariable("id") Long appointmentId,
                                                                  @Valid @RequestBody RescheduleRequest req,
                                                                  Authentication authentication) {
        try {
            Long actingUserId = (Long) authentication.getPrincipal();
            Appointment saved = appointmentService.rescheduleAppointment(
                    appointmentId, actingUserId, req.getNewRequestedDateTime(), req.isByAdmin()
            );
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment re-scheduled successfully.", AppointmentMapper.toDTO(saved)));
        } catch (Exception e) {
            log.error("Error rescheduling: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Error rescheduling", null));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDTO>> cancel(@PathVariable("id") Long appointmentId,
                                                              @Valid @RequestBody CancelRequest req,
                                                              Authentication authentication) {
        try {
            Long actingUserId = (Long) authentication.getPrincipal();
            Appointment saved = appointmentService.cancelAppointment(appointmentId, actingUserId, req.isByAdmin(), req);
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment cancelled successfully.", AppointmentMapper.toDTO(saved)));
        } catch (Exception e) {
            log.error("Error cancelling: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Error cancelling", null));
        }
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> cancelAppointmentForPatient(@PathVariable Long id, Authentication auth) {
        try {
            Long patientUserId = (Long) auth.getPrincipal();
            appointmentService.cancelAppointmentForPatient(id, patientUserId);
            return ResponseEntity.ok("Appointment cancelled successfully");
        } catch (Exception e) {
            log.error("Error cancelling for patient: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error cancelling appointment");
        }
    }



    @PostMapping("/{originalId}/reconsult")
    public ResponseEntity<ApiResponse<AppointmentDTO>> createReconsult(@PathVariable("originalId") Long originalAppointmentId,
                                                                       Authentication authentication) {
        try {
            Long patientUserId = (Long) authentication.getPrincipal();
            Appointment saved = appointmentService.createReconsult(originalAppointmentId, patientUserId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Re-consult appointment created successfully.", AppointmentMapper.toDTO(saved)));
        } catch (Exception e) {
            log.error("Error creating reconsult: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Error creating reconsult", null));
        }
    }

    @GetMapping("/pending/{specialization}")
    public ResponseEntity<List<AppointmentDTO>> findAllByDoctor(Authentication authentication) {
        try {
            Long doctorUserId = (Long) authentication.getPrincipal();
            List<AppointmentDTO> appointmentsByDoctor = appointmentService.findByDoctorUserId(doctorUserId)
                    .stream()
                    .map(AppointmentMapper::toDTO)
                    .toList();
            return ResponseEntity.ok(appointmentsByDoctor);
        } catch (Exception e) {
            log.error("Error finding by doctor: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(List.of());
        }
    }

    @GetMapping("/patient")
    public ResponseEntity<List<AppointmentDTO>> findAllByPatient(Authentication authentication) {
        try {
            Long patientUserId = (Long) authentication.getPrincipal();
            List<AppointmentDTO> appointmentsByPatient = appointmentService.findByPatientUserId(patientUserId)
                    .stream()
                    .map(AppointmentMapper::toDTO)
                    .toList();
            return ResponseEntity.ok(appointmentsByPatient);
        } catch (Exception e) {
            log.error("Error finding by patient: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(List.of());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> findByDoctor(@PathVariable("id") Long appointmentId, Authentication authentication) {
        try {
            Long actingUserId = (Long) authentication.getPrincipal();
            Appointment appointment = appointmentService.findByAppointmentId(appointmentId, actingUserId);
            return ResponseEntity.ok(AppointmentMapper.toDTO(appointment));
        } catch (Exception e) {
            log.error("Error finding appointment: {}", e.getMessage(), e);
            return ResponseEntity.status(404).body(null);
        }
    }
    // ... no changes to imports or fields ...

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentDTO>> rescheduleAppointment(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest req,
            Authentication authentication) {
        try {
            Long actingUserId = (Long) authentication.getPrincipal();
            // NEW: Get the appointment from the service method's return value
            Appointment appt = appointmentService.rescheduleAppointment(id, req.getNewRequestedDateTime(), req.getReason(), actingUserId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment rescheduled successfully.", AppointmentMapper.toDTO(appt)));
        } catch (ConflictException e) {
            log.error("Conflict rescheduling appointment ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error rescheduling appointment ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "An unexpected error occurred. Please contact support.", null));
        }
    }
    

    
    @PutMapping("/{id}/reassign")
    @PreAuthorize("hasRole('ADMIN')")  // Ensure only admins can reassign
    public ResponseEntity<ApiResponse<AppointmentDTO>> reassignAppointment(
            @PathVariable Long id,
            @Valid @RequestBody ReassignRequest req,  // Use existing ReassignRequest DTO
            Authentication authentication) {
        try {
            Long actingUserId = (Long) authentication.getPrincipal();
            appointmentService.reassignAppointment(id, req.getNewDoctorUserId(), req.getRequestedDateTime(), req.getReason(), actingUserId);
            Appointment appt = appointmentRepository.findById(id).orElseThrow();
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment reassigned successfully.", AppointmentMapper.toDTO(appt)));
        } catch (ConflictException e) {
            log.error("Conflict reassigning appointment ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error reassigning appointment ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "An unexpected error occurred. Please contact support.", null));
        }
    }
    @PutMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")  // Ensure only admins can archive
    public ResponseEntity<ApiResponse<Void>> archiveAppointment(@PathVariable Long id, Authentication authentication) {
        try {
            Long actingUserId = (Long) authentication.getPrincipal();
            appointmentService.archiveAppointment(id, actingUserId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment archived successfully.", null));
        } catch (ResourceNotFoundException e) {
            log.warn("Appointment not found for archiving: {}", id);
            return ResponseEntity.status(404).body(new ApiResponse<>(false, "Appointment not found.", null));
        } catch (ConflictException e) {
            log.error("Conflict archiving appointment ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Unexpected error archiving appointment ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "An unexpected error occurred. Please contact support.", null));
        }
    }
    @GetMapping("/doctor/reconsults")
    public ResponseEntity<List<AppointmentDTO>> findReconsultsByDoctor(Authentication authentication) {
        try {
            Long doctorUserId = (Long) authentication.getPrincipal();
            List<AppointmentDTO> list = appointmentService.findByDoctorReconsults(doctorUserId)
                    .stream()
                    .map(AppointmentMapper::toDTO)
                    .toList();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("Error finding reconsults: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(List.of());
        }
    }
}
