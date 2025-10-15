package com.medicare.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.medicare.dto.AdminRegistrationRequest;
import com.medicare.dto.ApiResponse;
import com.medicare.dto.DoctorProfileUpdateRequest;
import com.medicare.dto.ReassignRequest;
import com.medicare.dto.RegisterPatientRequest;
import com.medicare.dto.RegisterRequest;
import com.medicare.entity.Admin;
import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;
import com.medicare.entity.Patient;
import com.medicare.entity.User;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.AdminRepository;
import com.medicare.service.AdminService;
import com.medicare.service.DoctorService;
import com.medicare.service.PatientService;
import com.medicare.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * AdminController
 *
 * - Admin endpoints (ROLE_ADMIN required by SecurityConfig)
 * - Super-admin-only checks are enforced inside services where needed.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final DoctorService doctorService;
    private final PatientService patientService;
    private final AdminRepository adminRepository;
    
    @PostMapping("/doctors")
    public ResponseEntity<ApiResponse<Doctor>> createDoctor(@Valid @RequestBody RegisterRequest req,
                                               Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        Doctor saved = doctorService.createDoctorAsAdmin(adminUserId, req);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Doctor created successfully.", saved));
    }
    
    @PutMapping("/doctors/{doctorUserId}")
    public ResponseEntity<ApiResponse<Doctor>> updateDoctor(@PathVariable Long doctorUserId,
                                               @Valid @RequestBody DoctorProfileUpdateRequest req,
                                               Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        Doctor updated = doctorService.updateDoctorAsAdmin(adminUserId, doctorUserId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor updated successfully.", updated));
    }


    @DeleteMapping("/doctors/{doctorUserId}")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long doctorUserId,
                                               Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        doctorService.deleteDoctor(adminUserId, doctorUserId);
        return ResponseEntity.ok("Doctor deleted successfully");
    }
    
    @DeleteMapping("/doctors/{doctorUserId}/block")
    public ResponseEntity<String> blockDoctor(@PathVariable Long doctorUserId,
                                               Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        doctorService.blockDoctor(adminUserId, doctorUserId);
        return ResponseEntity.ok("Doctor blocked successfully");
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> listDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    // ---------------- Patient Management ----------------
    @PostMapping("/patients")
    public ResponseEntity<ApiResponse<Patient>> createPatient(@Valid @RequestBody RegisterPatientRequest req,
                                                 Authentication authentication) {
        // Authentication check for admin
        Long adminUserId = (Long) authentication.getPrincipal();
        adminRepository.findByUserId(adminUserId)
        	.orElseThrow(() -> new ResourceNotFoundException("User is not Admin"));
        Patient saved = patientService.createPatientByAdmin(req);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Patient created successfully.", saved));
    }
    
    @PutMapping("/patients/{patientUserId}")
    public ResponseEntity<ApiResponse<Patient>> updatePatient(@PathVariable Long patientUserId,
                                                 @Valid @RequestBody Patient patient,
                                                 @RequestParam(required = false) User.Status status,
                                                 Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        adminRepository.findByUserId(adminUserId)
        	.orElseThrow(() -> new ResourceNotFoundException("User is not Admin"));
        Patient updated = patientService.updatePatientByAdmin(patientUserId, patient, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient updated successfully.", updated));
    }


    @DeleteMapping("/patients/{patientUserId}")
    public ResponseEntity<String> deletePatient(@PathVariable Long patientUserId,
                                                Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        patientService.deletePatient(adminUserId, patientUserId);
        return ResponseEntity.ok("Patient deleted successfully");
    }
    
    @DeleteMapping("/patients/{patientUserId}/block")
    public ResponseEntity<String> blockPatient(@PathVariable Long patientUserId,
                                                Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        patientService.blockPatient(adminUserId, patientUserId);
        return ResponseEntity.ok("Patient blocked successfully");
    }

    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> listPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    // ---------------- Admin Management (SuperAdmin only) ----------------
    @PostMapping("/admins")
    public ResponseEntity<ApiResponse<Admin>> createAdmin(@Valid @RequestBody AdminRegistrationRequest request,
                                             Authentication authentication) {
        Long superAdminUserId = (Long) authentication.getPrincipal();
        Admin saved = adminService.createAdmin(superAdminUserId, request);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Admin created successfully.", saved));
    }
    
    @PutMapping("/admins/{adminUserId}")
    public ResponseEntity<ApiResponse<Admin>> updateAdmin(@PathVariable Long adminUserId,
                                             @Valid @RequestBody AdminRegistrationRequest req,
                                             Authentication authentication) {
        Long actingAdminUserId = (Long) authentication.getPrincipal();
        Admin updated = adminService.updateAdmin(actingAdminUserId, adminUserId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Admin updated successfully.", updated));
    }

    @DeleteMapping("/admins/{adminUserId}")
    public ResponseEntity<String> deleteAdmin(@PathVariable Long adminUserId,
                                              Authentication authentication) {
        Long superAdminUserId = (Long) authentication.getPrincipal();
        adminService.deleteAdmin(superAdminUserId, adminUserId);
        return ResponseEntity.ok("Admin deleted successfully");
    }
    
    @DeleteMapping("/admins/{adminUserId}/block")
    public ResponseEntity<String> blockAdmin(@PathVariable Long adminUserId,
                                              Authentication authentication) {
        Long superAdminUserId = (Long) authentication.getPrincipal();
        adminService.blockAdmin(superAdminUserId, adminUserId);
        return ResponseEntity.ok("Admin block successfully");
    }

    @GetMapping("/admins")
    public ResponseEntity<List<Admin>> listAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    // Approve doctor
    @PostMapping("/doctors/{doctorUserId}/approve")
    public ResponseEntity<String> approveDoctor(@PathVariable Long doctorUserId,
                                                Authentication authentication) {
        Long actingAdminUserId = (Long) authentication.getPrincipal();
        adminService.approveDoctor(actingAdminUserId, doctorUserId);
        return ResponseEntity.ok("Doctor approved");
    }

    // Block/unblock user
    @PostMapping("/users/{userId}/status")
    public ResponseEntity<String> setUserStatus(@PathVariable Long userId,
                                                @RequestParam("status") User.Status status,
                                                Authentication authentication) {
        Long actingAdminUserId = (Long) authentication.getPrincipal();
        adminService.setUserStatus(actingAdminUserId, userId, status);
        return ResponseEntity.ok("User status updated to " + status);
    }

    // View pending appointments (non-reconsult)
    @GetMapping("/appointments/pending")
    public ResponseEntity<List<Appointment>> viewPending() {
        return ResponseEntity.ok(adminService.viewPendingAppointments());
    }

    // Reassign an appointment
    @PostMapping("/appointments/{appointmentId}/reassign")
    public ResponseEntity<ApiResponse<Appointment>> reassign(@PathVariable Long appointmentId,
                                                @Valid @RequestBody ReassignRequest req,
                                                Authentication authentication) {
        Long actingAdminUserId = (Long) authentication.getPrincipal();
        Appointment saved = adminService.reassignAppointment(actingAdminUserId, appointmentId, req.getNewDoctorUserId(), req.getNewAvailabilityId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment re-assigned to Mr/Mrs/Ms. "+saved.getDoctor().getUser().getFullName()+" successfully.", saved));
    }

    // CRUD on Doctors (any active admin) — create/update/delete doctor profiles
    // For simplicity these endpoints delegate to services you already have (DoctorService).
    // Implementation examples omitted here — call doctorService.createOrUpdateDoctorProfile etc.

    // Super-admin-only: create another admin → routed to AuthService.registerAdmin in controller earlier
    // Deleting admins should be enforced inside service and protected by super-admin checks.
}