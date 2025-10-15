package com.medicare.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicare.dto.ApiResponse;
import com.medicare.dto.PatientProfileUpdateRequest;
import com.medicare.entity.Patient;
import com.medicare.service.PatientService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * PatientController
 *
 * - Patients manage their own profile (create/update/read).
 */
@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    
    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<Patient>> updateProfile(@Valid @RequestBody PatientProfileUpdateRequest req,
                                                Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Patient updated = patientService.updatePatientProfile(userId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully.", updated));
    }

    @GetMapping("/profile")
    public ResponseEntity<Patient> getProfile(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Patient patient = patientService.getPatientByUserId(userId);
        return ResponseEntity.ok(patient);
    }
}