

package com.medicare.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicare.dto.ApiResponse;
import com.medicare.dto.PatientProfileUpdateRequest;
import com.medicare.dto.PrescriptionResponseDTO;
import com.medicare.entity.Appointment;
import com.medicare.entity.Patient;
import com.medicare.entity.Prescription;
import com.medicare.mapper.PrescriptionMapper;
import com.medicare.service.AppointmentService;
import com.medicare.service.PatientService;
import com.medicare.service.PrescriptionService;

import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * PatientController
 *
 * - Patients manage their own profile (create/update/read).
 * - Added endpoints for appointments, prescriptions, and payments.
 */
@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
@Slf4j
public class PatientController {
	 @Autowired
    private final PatientService patientService;
    private final AppointmentService appointmentService;  // Ensure this is injected
    private final PrescriptionService prescriptionService;  // Ensure this is injected
    
    @PutMapping("/profile")  // Changed to PUT for updates
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Patient>> updateProfile(@Valid @RequestBody PatientProfileUpdateRequest req,
                                                Authentication authentication) {
        try {
            Long userId = (Long) authentication.getPrincipal();
            log.info("Updating profile for userId: {}", userId);
            
            Patient updated = patientService.updatePatientProfile(userId, req);
            log.info("Profile updated successfully for userId: {}", userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully.", updated));
        } catch (ConstraintViolationException e) {
            log.error("Validation error updating profile: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Invalid input data. Please check your email format or other fields.", null));
        } catch (DataIntegrityViolationException e) {
            log.error("Data integrity error updating profile: {}", e.getMessage());
            if (e.getMessage().contains("email_id")) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Email already exists. Please use a different email.", null));
            } else if (e.getMessage().contains("phone_number")) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Phone number already exists. Please use a different phone number.", null));
            } else {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Duplicate data error. Please check your input.", null));
            }
        } catch (Exception e) {
            log.error("Unexpected error updating profile: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "An unexpected error occurred. Please contact support.", null));
        }
    }

    @GetMapping("/profile")  // Done
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Patient> getProfile(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Patient patient = patientService.getPatientByUserId(userId);
        return ResponseEntity.ok(patient);
    }

    // Added: Get patient's appointments
    @GetMapping("/appointments")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<Appointment>> getAppointments(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<Appointment> appointments = appointmentService.findByPatientUserId(userId);
        return ResponseEntity.ok(appointments);
    }

    // Added: Get patient's prescriptions
    @GetMapping("/prescriptions")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<PrescriptionResponseDTO>> getPrescriptions(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<Prescription> prescriptions = prescriptionService.findByPatientUserId(userId);
        
        List<PrescriptionResponseDTO> dtos = prescriptions.stream()
            .map(PrescriptionMapper::toDto)
            .toList();
        return ResponseEntity.ok(dtos);
    }
}
