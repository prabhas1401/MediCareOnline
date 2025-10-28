
package com.medicare.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicare.dto.AddLeaveRequest;
import com.medicare.dto.ApiResponse;
import com.medicare.dto.AppointmentDTO;
import com.medicare.dto.DoctorDTO;
import com.medicare.dto.DoctorProfileUpdateRequest;
import com.medicare.dto.PatientAdminUpdateRequest;
import com.medicare.dto.PatientDTO;
import com.medicare.dto.ReconsultScheduleRequest;
import com.medicare.dto.RegisterPatientRequest;
import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;
import com.medicare.entity.DoctorLeave;
import com.medicare.entity.Patient;
import com.medicare.mapper.AppointmentMapper;
import com.medicare.mapper.MapPatient;
import com.medicare.repository.DoctorRepository;
import com.medicare.service.AppointmentService;
import com.medicare.service.DoctorLeaveService;
import com.medicare.service.DoctorService;
import com.medicare.service.PatientService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * DoctorController
 */
@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
@Slf4j  // UPDATED: Ensures logging is available via Lombok
public class DoctorController {

    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final PatientService patientService;
    private final DoctorRepository doctorRepository;
    private final DoctorLeaveService doctorLeaveService;

    // Helper method to verify doctor (your existing method)
    private Doctor verifyDoctor(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    // Added method to get current user ID (for getProfile)
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            return (Long) authentication.getPrincipal();
        }
        throw new RuntimeException("User not authenticated");
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            Long userId = getCurrentUserId();
            DoctorDTO profile = doctorService.getProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching profile: " + e.getMessage());
        }
    }
    

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Doctor>> updateProfile(@Valid @RequestBody DoctorProfileUpdateRequest req, Authentication authentication) {
        Doctor doctor = verifyDoctor(authentication);
        Doctor saved = doctorService.updateOwnProfile(doctor.getUser().getUserId(), req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully.", null));
    }

    @PostMapping("/patients")  // Changed from /add-patient to match frontend
    public ResponseEntity<ApiResponse<Patient>> createPatient(@Valid @RequestBody RegisterPatientRequest req, Authentication authentication) {
        verifyDoctor(authentication);
        Patient saved = patientService.createPatient(req);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Patient created by doctor successfully.", null));
    }

    @PutMapping("/patient/{patientUserId}")
    public ResponseEntity<ApiResponse<Patient>> updatePatient(@PathVariable Long patientUserId, @Valid @RequestBody PatientAdminUpdateRequest req, Authentication authentication) {
        verifyDoctor(authentication);
        Patient updated = patientService.updatePatient(patientUserId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient updated by doctor successfully.", null));
    }

    @GetMapping("/patient/{patientUserId}")
    public ResponseEntity<PatientDTO> getPatient(@PathVariable Long patientUserId, Authentication authentication) {
        verifyDoctor(authentication);
        Patient patient = doctorService.getPatient(patientUserId);
        return ResponseEntity.ok(MapPatient.toDTO(patient));
    }

    @PostMapping("/reconsult/{id}/schedule")
    public ResponseEntity<ApiResponse<AppointmentDTO>> scheduleReconsult(@PathVariable("id") Long reconsultId, @Valid @RequestBody ReconsultScheduleRequest req, Authentication authentication) {
        Long actingUserId = verifyDoctor(authentication).getUser().getUserId();
        Appointment saved = appointmentService.scheduleReconsult(reconsultId, actingUserId, req.getNewRequestedDateTime());
        return ResponseEntity.ok(new ApiResponse<>(true, "Re-consult appointment scheduled successfully.", AppointmentMapper.toDTO(saved)));
    }

    @PostMapping("/reconsult/{reconsultId}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentDTO>> rescheduleReconsult(@PathVariable Long reconsultId, @Valid @RequestBody ReconsultScheduleRequest req, Authentication authentication) {
        Long doctorUserId = verifyDoctor(authentication).getUser().getUserId();
        Appointment updated = appointmentService.rescheduleReconsult(reconsultId, doctorUserId, req.getNewRequestedDateTime());
        return ResponseEntity.ok(new ApiResponse<>(true, "Re-consult appointment re-scheduled successfully.", AppointmentMapper.toDTO(updated)));
    }

    @PostMapping("/leaves")
    public ResponseEntity<ApiResponse<DoctorLeave>> addLeave(@Valid @RequestBody AddLeaveRequest req, Authentication authentication) {
        Doctor doctor = verifyDoctor(authentication);
        DoctorLeave saved = doctorLeaveService.addLeave(doctor.getUser().getUserId(), req);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Doctor Leave updated successfully.", saved));
    }

    @GetMapping("/pending-appointments")  // NEW: Added to match frontend call (/api/doctor/pending-appointments)
    public ResponseEntity<List<AppointmentDTO>> viewPendingForDoctor(Authentication authentication) {
        Doctor doctor = verifyDoctor(authentication);
        List<AppointmentDTO> response = doctorService.getPendingAppointmentsForDoctor(doctor.getUser().getUserId())
                .stream()
                .map(AppointmentMapper::toDTO)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/appointments")  // Existing endpoint
    public ResponseEntity<List<AppointmentDTO>> getAppointments(Authentication authentication) {
        try {
            Long doctorUserId = (Long) authentication.getPrincipal();
            List<Appointment> appointments = appointmentService.findByDoctorUserId(doctorUserId);
            List<AppointmentDTO> dtos = appointments.stream()
                    .map(AppointmentMapper::toDTO)
                    .toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            // UPDATED: Enhanced logging and error response (uses @Slf4j)
            log.error("Error fetching appointments for doctor: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ArrayList<>());  // Return empty list on error
        }
    }

    // New endpoint for rescheduling appointments
    @PostMapping("/appointments/{id}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            doctorService.rescheduleAppointment(id, request.get("newRequestedDateTime"));
            return ResponseEntity.ok("Appointment rescheduled");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error rescheduling appointment: " + e.getMessage());
        }
    }
}