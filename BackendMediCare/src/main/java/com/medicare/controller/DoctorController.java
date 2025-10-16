package com.medicare.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.medicare.dto.AddLeaveRequest;
import com.medicare.dto.ApiResponse;
import com.medicare.dto.DoctorProfileUpdateRequest;
import com.medicare.dto.RescheduleRequest;
import com.medicare.entity.Appointment;
import com.medicare.entity.Availability;
import com.medicare.entity.Doctor;
import com.medicare.entity.DoctorLeave;
import com.medicare.entity.Patient;
import com.medicare.service.AppointmentService;
import com.medicare.service.DoctorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * DoctorController
 *
 * - Doctor profile operations (create/update)
 * - Manage patient records (CRUD)
 * - Manage availability & leave
 * - Doctors should only affect patient records they create/manage (business rule)
 */

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final AppointmentService appointmentService;


    // ---------- Doctor updates their profile ----------
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Doctor>> updateProfile(@Valid @RequestBody DoctorProfileUpdateRequest req,
                                                Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Doctor saved = doctorService.updateOwnProfile(userId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully.", saved));
    }

    // ---------- Create / Update Patient record (Doctor-managed CRUD) ----------
    @PostMapping("/patients")
    public ResponseEntity<ApiResponse<Patient>> createPatient(@Valid @RequestBody Patient payload,
                                                 Authentication authentication) {
        Long doctorUserId = (Long) authentication.getPrincipal();
        Patient saved = doctorService.createOrUpdatePatientRecord(doctorUserId, payload);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Patient created successfully.", saved));
    }

    @PutMapping("/patients/{patientUserId}")
    public ResponseEntity<ApiResponse<Patient>> updatePatient(@PathVariable Long patientUserId,
                                                 @Valid @RequestBody Patient payload,
                                                 Authentication authentication) {
        Long doctorUserId = (Long) authentication.getPrincipal();
        // ensure payload.user.userId equals patientUserId (or set it)
        if (payload.getUser() == null) payload.setUser(new com.medicare.entity.User());
        payload.getUser().setUserId(patientUserId);
        Patient saved = doctorService.createOrUpdatePatientRecord(doctorUserId, payload);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient updated successfully.", saved));
    }

    @GetMapping("/patients/{patientUserId}")
    public ResponseEntity<Patient> getPatient(@PathVariable Long patientUserId) {
        Patient patient = doctorService.getPatient(patientUserId);
        return ResponseEntity.ok(patient);
    }
    
    @PostMapping("/reconsults/{reconsultId}/reschedule")
    public ResponseEntity<ApiResponse<Appointment>> rescheduleReconsult(
            @PathVariable Long reconsultId,
            @Valid @RequestBody RescheduleRequest req,
            Authentication authentication) {
    	Long doctorUserId = (Long) authentication.getPrincipal();
    	Appointment updated = appointmentService.rescheduleReconsult(reconsultId, doctorUserId, req.getNewAvailabilityId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Re-consult appointment re-scheduled successfully.", updated));
    }


    // ---------- Availability ----------
    @PostMapping("/availability")
    public ResponseEntity<ApiResponse<Availability>> addAvailability(@Valid @RequestBody Availability slot,
                                                        Authentication authentication) {
        Long doctorUserId = (Long) authentication.getPrincipal();
        Availability saved = doctorService.addAvailability(doctorUserId, slot);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Availability slot created successfully.", saved));
    }

    // ---------- Leaves ----------
    @PostMapping("/leaves")
    public ResponseEntity<ApiResponse<DoctorLeave>> addLeave(@Valid @RequestBody AddLeaveRequest req,
                                                Authentication authentication) {
        Long doctorUserId = (Long) authentication.getPrincipal();
        DoctorLeave saved = doctorService.addLeave(doctorUserId, req.getDate(), req.getReason());
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Doctor Leave updated successfully.", saved));
    }
}