package com.medicare.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.medicare.dto.AdminDTO;
import com.medicare.dto.AdminRegistrationRequest;
import com.medicare.dto.ApiResponse;
import com.medicare.dto.AppointmentDTO;
import com.medicare.dto.CancelledAppointmentDTO;
import com.medicare.dto.DoctorDTO;
import com.medicare.dto.DoctorProfileUpdateRequest;
import com.medicare.dto.PatientAdminUpdateRequest;
import com.medicare.dto.PatientDTO;
import com.medicare.dto.ReassignRequest;
import com.medicare.dto.RegisterPatientRequest;
import com.medicare.dto.RegisterRequest;
import com.medicare.entity.Admin;
import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;
import com.medicare.entity.Patient;
import com.medicare.entity.User;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.mapper.AppointmentMapper;
import com.medicare.mapper.CancelledAppointmentMapper;
import com.medicare.mapper.MapDoctor;
import com.medicare.repository.AdminRepository;
import com.medicare.repository.CancelledAppointmentRepository;
import com.medicare.service.AdminService;
import com.medicare.service.DoctorService;
import com.medicare.service.PatientService;

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
    private final DoctorService doctorService;
    private final PatientService patientService;
    private final AdminRepository adminRepository;
	private final CancelledAppointmentRepository cancelledAppointmentRepository;
	
	@Autowired
	private CancelledAppointmentMapper cancelledAppointmentMapper;
    
    @PostMapping("/doctors")		//Done
    public ResponseEntity<ApiResponse<Doctor>> createDoctor(@Valid @RequestBody RegisterRequest req,
                                               Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        Doctor saved = doctorService.createDoctorAsAdmin(adminUserId, req);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Doctor created successfully.", null));
    }
    
    @PutMapping("/doctors/{doctorUserId}")		//Done
    public ResponseEntity<ApiResponse<Doctor>> updateDoctor(@PathVariable Long doctorUserId,
                                               @Valid @RequestBody DoctorProfileUpdateRequest req,
                                               Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        Doctor updated = doctorService.updateDoctorAsAdmin(adminUserId, doctorUserId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor updated by admin successfully.", null));
    }


    @DeleteMapping("/doctor/{doctorUserId}/delete")		//Done
    public ResponseEntity<String> deleteDoctor(@PathVariable Long doctorUserId,
                                               Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        doctorService.deleteDoctor(adminUserId, doctorUserId);
        return ResponseEntity.ok("Doctor deleted successfully");
    }
    
    @DeleteMapping("/doctor/{doctorUserId}/block")		//Done
    public ResponseEntity<String> blockDoctor(@PathVariable Long doctorUserId,
                                               Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        doctorService.blockDoctor(adminUserId, doctorUserId);
        return ResponseEntity.ok("Doctor blocked successfully");
    }

    @GetMapping("/doctors")			//Done
    public ResponseEntity<List<DoctorDTO>> listDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }
    
    @GetMapping("/doctors/by-specialization")		//Done
    public ResponseEntity<List<DoctorDTO>> getDoctorsBySpecialization(@RequestParam Doctor.Specialization specialization,
            Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        List<Doctor> doctors = doctorService.findBySpecializationAndActive(specialization, adminUserId);

        List<DoctorDTO> safeList = doctors.stream()
                                              .map(MapDoctor::toDTO)
                                              .toList();
        return ResponseEntity.ok(safeList);
    }

    // ---------------- Patient Management ----------------
    @PostMapping("/patients")			//Done
    public ResponseEntity<ApiResponse<Patient>> createPatient(@Valid @RequestBody RegisterPatientRequest req,
                                                 Authentication authentication) {
        // Authentication check for admin
        Long adminUserId = (Long) authentication.getPrincipal();
        adminRepository.findByUserId(adminUserId)
        	.orElseThrow(() -> new ResourceNotFoundException("User is not Admin"));
        Patient saved = patientService.createPatient(req);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Patient created by admin successfully.", null));
    }
    
    @PutMapping("/patients/{patientUserId}")		//Done
    public ResponseEntity<ApiResponse<Patient>> updatePatient(@PathVariable Long patientUserId,
                                                 @Valid @RequestBody PatientAdminUpdateRequest req,
                                                 Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        adminRepository.findByUserId(actingUserId)
        	.orElseThrow(() -> new ForbiddenException("Only admins can update patients"));
        
        Patient updated = patientService.updatePatient(patientUserId, req);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient updated by admin successfully.", null));
    }


    @DeleteMapping("/patients/{patientUserId}/delete")			//Done
    public ResponseEntity<String> deletePatient(@PathVariable Long patientUserId,
                                                Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        patientService.deletePatient(adminUserId, patientUserId);
        return ResponseEntity.ok("Patient deleted by admin successfully");
    }
    
    @DeleteMapping("/patients/{patientUserId}/block")		//Done
    public ResponseEntity<String> blockPatient(@PathVariable Long patientUserId,
                                                Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        patientService.blockPatient(adminUserId, patientUserId);
        return ResponseEntity.ok("Patient blocked by admin successfully");
    }

    @GetMapping("/patients")			//Done
    public ResponseEntity<List<PatientDTO>> listPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    // ---------------- Admin Management (SuperAdmin only) ----------------
    @PostMapping("/admins")				//Done
    public ResponseEntity<ApiResponse<Admin>> createAdmin(@Valid @RequestBody AdminRegistrationRequest request,
                                             Authentication authentication) {
        Long superAdminUserId = (Long) authentication.getPrincipal();
        Admin saved = adminService.createAdmin(superAdminUserId, request);
        return ResponseEntity.status(201).body(new ApiResponse<>(
        		true, request.isSuperAdmin()?"Super Admin created successfully":"Admin created successfully.", null));
    }
    
    @PutMapping("/admins/{adminUserId}")			//Done
    public ResponseEntity<ApiResponse<Admin>> updateAdmin(@PathVariable Long adminUserId,
                                             @Valid @RequestBody AdminRegistrationRequest req,
                                             Authentication authentication) {
        Long actingAdminUserId = (Long) authentication.getPrincipal();
        Admin updated = adminService.updateAdmin(actingAdminUserId, adminUserId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Admin updated successfully.", null));
    }

    @DeleteMapping("/admins/{adminUserId}/delete")			//Done
    public ResponseEntity<String> deleteAdmin(@PathVariable Long adminUserId,
                                              Authentication authentication) {
        Long superAdminUserId = (Long) authentication.getPrincipal();
        String targetAdmin = adminService.deleteAdmin(superAdminUserId, adminUserId);
        return ResponseEntity.ok(targetAdmin +" deleted successfully");
    }
    
    @DeleteMapping("/admins/{adminUserId}/block")			//Done	
    public ResponseEntity<String> blockAdmin(@PathVariable Long adminUserId,
                                              Authentication authentication) {
        Long superAdminUserId = (Long) authentication.getPrincipal();
        String adminName = adminService.blockAdmin(superAdminUserId, adminUserId);
        return ResponseEntity.ok(adminName+ " blocked successfully");
    }

    @GetMapping("/admins")				//Done
    public ResponseEntity<List<AdminDTO>> listAdmins(Authentication authentication) {
    	Long actingUserId = (Long) authentication.getPrincipal();
    	
        return ResponseEntity.ok(adminService.getAllAdmins(actingUserId));
    }

    // Approve doctor
    @PostMapping("/doctors/{doctorUserId}/approve")			//Done
    public ResponseEntity<String> approveDoctor(@PathVariable Long doctorUserId,
                                                Authentication authentication) {
        Long actingAdminUserId = (Long) authentication.getPrincipal();
        adminService.approveDoctor(actingAdminUserId, doctorUserId);
        return ResponseEntity.ok("Doctor approved");
    }

    // Block/unblock user
    @PostMapping("/users/{userId}/status")			//Done
    public ResponseEntity<String> setUserStatus(@PathVariable Long userId,
                                                @RequestParam("status") User.Status status,
                                                Authentication authentication) {
        Long actingAdminUserId = (Long) authentication.getPrincipal();
        String name = adminService.setUserStatus(actingAdminUserId, userId, status);
        return ResponseEntity.ok(name+" status updated to " + status);
    }

    // View pending appointments (non-reconsult)
    @GetMapping("/appointments/pending")			//Done
    public ResponseEntity<List<AppointmentDTO>> viewPending() {
        List<AppointmentDTO> response = adminService.viewPendingAppointments()
                .stream()
                .map(AppointmentMapper::toDTO)
                .toList();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/appointments/cancelled-by-doctor")			//Done
    public ResponseEntity<List<CancelledAppointmentDTO>> getDoctorCancelledAppointments() {
        List<CancelledAppointmentDTO> cancelled = cancelledAppointmentRepository.findAllByReassignedFalseOrderByCancelledAtDesc().stream()
        	    .map(cancelledAppointmentMapper::toDTO)
        	    .collect(Collectors.toList());
        return ResponseEntity.ok(cancelled);
    }
    
    @GetMapping("/appointments/cancelled-by-doctor-all")		//Done
    public ResponseEntity<List<CancelledAppointmentDTO>> getCancelledAppointments() {
        List<CancelledAppointmentDTO> cancelledAll = cancelledAppointmentRepository.findAll().stream()
        	    .map(cancelledAppointmentMapper::toDTO)
        	    .collect(Collectors.toList());
        return ResponseEntity.ok(cancelledAll);
    }

    // Reassign an appointment
    @PostMapping("/appointments/{appointmentId}/reassign")			//Done
    public ResponseEntity<ApiResponse<AppointmentDTO>> reassign(@PathVariable Long appointmentId,
                                                @Valid @RequestBody ReassignRequest req,
                                                Authentication authentication) {
        Long actingAdminUserId = (Long) authentication.getPrincipal();
        Appointment saved = adminService.reassignAppointment(actingAdminUserId, appointmentId, req.getNewDoctorUserId(), req.getRequestedDateTime());
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment re-assigned to Dr. "+saved.getDoctor().getUser().getFullName()+" successfully.", AppointmentMapper.toDTO(saved)));
    }
    
    
}