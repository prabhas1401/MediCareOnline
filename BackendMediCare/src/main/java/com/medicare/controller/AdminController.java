package com.medicare.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import com.medicare.dto.CancelRequest;
import com.medicare.dto.CancelledAppointmentDTO;
import com.medicare.dto.DoctorDTO;
import com.medicare.dto.DoctorProfileUpdateRequest;
import com.medicare.dto.PatientAdminUpdateRequest;
import com.medicare.dto.PatientDTO;
import com.medicare.dto.ReassignRequest;
import com.medicare.dto.RegisterPatientRequest;
import com.medicare.dto.RegisterRequest;
import com.medicare.dto.RescheduleRequest;
import com.medicare.dto.ScheduleRequest;
import com.medicare.entity.Admin;
import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;
import com.medicare.entity.Patient;
import com.medicare.entity.User;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.mapper.AppointmentMapper;
import com.medicare.mapper.CancelledAppointmentMapper;
import com.medicare.mapper.MapDoctor;
import com.medicare.repository.AdminRepository;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.CancelledAppointmentRepository;
import com.medicare.service.AdminService;
import com.medicare.service.AppointmentService;
import com.medicare.service.DoctorService;
import com.medicare.service.PatientService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminController {

    private final AdminService adminService;
    private final DoctorService doctorService;
    private final PatientService patientService;
    private final AdminRepository adminRepository;
    private final CancelledAppointmentRepository cancelledAppointmentRepository;
    private final AppointmentService appointmentService;
    @Autowired
    private CancelledAppointmentMapper cancelledAppointmentMapper;
    @Autowired
    private AppointmentRepository appointmentRepository;  // Added for approve endpoint

    // Doctor Management
    @PostMapping("/doctors")
    public ResponseEntity<ApiResponse<Doctor>> createDoctor(@Valid @RequestBody RegisterRequest req, Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        // Check for duplicates
        if (doctorService.existsByPhone(req.getPhoneNumber()) || doctorService.existsByEmail(req.getEmailId())) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Phone or email already exists.", null));
        }
        Doctor saved = doctorService.createDoctorAsAdmin(adminUserId, req);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Doctor created successfully.", null));
    }
    
    @PutMapping("/doctors/{doctorUserId}")
    public ResponseEntity<ApiResponse<Doctor>> updateDoctor(@PathVariable Long doctorUserId, @Valid @RequestBody DoctorProfileUpdateRequest req, Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        Doctor updated = doctorService.updateDoctorAsAdmin(adminUserId, doctorUserId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor updated by admin successfully.", null));
    }

    @DeleteMapping("/doctor/{doctorUserId}/delete")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long doctorUserId, Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        doctorService.deleteDoctor(adminUserId, doctorUserId);
        return ResponseEntity.ok("Doctor deleted successfully");
    }
    
    @DeleteMapping("/doctor/{doctorUserId}/block")
    public ResponseEntity<String> blockDoctor(@PathVariable Long doctorUserId, Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        doctorService.blockDoctor(adminUserId, doctorUserId);
        return ResponseEntity.ok("Doctor blocked successfully");
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorDTO>> listDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }
    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments() {
        List<Appointment> all = appointmentRepository.findAll();
        List<AppointmentDTO> dtos = all.stream().map(AppointmentMapper::toDTO).toList();
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/appointments/cancelled")
    public ResponseEntity<List<AppointmentDTO>> getCancelledAppointments() {
        try {
            List<Appointment> appointments = appointmentService.getCancelledAppointments();
            List<AppointmentDTO> dtos = appointments.stream()
                    .map(AppointmentMapper::toDTO)
                    .toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching cancelled appointments: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ArrayList<>());  // Return empty list on error
        }
    }
    
    @GetMapping("/doctors/by-specialization")
    public ResponseEntity<List<DoctorDTO>> getDoctorsBySpecialization(@RequestParam Doctor.Specialization specialization, Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        List<Doctor> doctors = doctorService.findBySpecializationAndActive(specialization, adminUserId);
        List<DoctorDTO> safeList = doctors.stream().map(MapDoctor::toDTO).toList();
        return ResponseEntity.ok(safeList);
    }

    // Patient Management
    @PostMapping("/patients")
    public ResponseEntity<ApiResponse<Patient>> createPatient(@Valid @RequestBody RegisterPatientRequest req, Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        adminRepository.findByUserId(adminUserId).orElseThrow(() -> new ResourceNotFoundException("User is not Admin"));
        Patient saved = patientService.createPatient(req);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Patient created by admin successfully.", null));
    }
    
    @PutMapping("/patients/{patientUserId}")
    public ResponseEntity<ApiResponse<Patient>> updatePatient(@PathVariable Long patientUserId, @Valid @RequestBody PatientAdminUpdateRequest req, Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        adminRepository.findByUserId(actingUserId).orElseThrow(() -> new ForbiddenException("Only admins can update patients"));
        Patient updated = patientService.updatePatient(patientUserId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient updated by admin successfully.", null));
    }

    @DeleteMapping("/patients/{patientUserId}/delete")
    public ResponseEntity<String> deletePatient(@PathVariable Long patientUserId, Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        patientService.deletePatient(adminUserId, patientUserId);
        return ResponseEntity.ok("Patient deleted by admin successfully");
    }
    
    @DeleteMapping("/patients/{patientUserId}/block")
    public ResponseEntity<String> blockPatient(@PathVariable Long patientUserId, Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        patientService.blockPatient(adminUserId, patientUserId);
        return ResponseEntity.ok("Patient blocked by admin successfully");
    }

    @GetMapping("/patients")
    public ResponseEntity<List<PatientDTO>> listPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    // Admin Management
    @PostMapping("/admins")
    public ResponseEntity<ApiResponse<Admin>> createAdmin(@Valid @RequestBody AdminRegistrationRequest request, Authentication authentication) {
        Long superAdminUserId = (Long) authentication.getPrincipal();
        Admin saved = adminService.createAdmin(superAdminUserId, request);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, request.isSuperAdmin() ? "Super Admin created successfully" : "Admin created successfully.", null));
    }
    
    @PutMapping("/admins/{adminUserId}")
    public ResponseEntity<ApiResponse<Admin>> updateAdmin(@PathVariable Long adminUserId, @Valid @RequestBody AdminRegistrationRequest req, Authentication authentication) {
        Long actingAdminUserId = (Long) authentication.getPrincipal();
        Admin updated = adminService.updateAdmin(actingAdminUserId, adminUserId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Admin updated successfully.", null));
    }

    @DeleteMapping("/admins/{adminUserId}/delete")
    public ResponseEntity<String> deleteAdmin(@PathVariable Long adminUserId, Authentication authentication) {
        Long superAdminUserId = (Long) authentication.getPrincipal();
        String targetAdmin = adminService.deleteAdmin(superAdminUserId, adminUserId);
        return ResponseEntity.ok(targetAdmin + " deleted successfully");
    }
    
    @DeleteMapping("/admins/{adminUserId}/block")
    public ResponseEntity<String> blockAdmin(@PathVariable Long adminUserId, Authentication authentication) {
        Long superAdminUserId = (Long) authentication.getPrincipal();
        String adminName = adminService.blockAdmin(superAdminUserId, adminUserId);
        return ResponseEntity.ok(adminName + " blocked successfully");
    }

    @GetMapping("/admins")
    public ResponseEntity<List<AdminDTO>> listAdmins(Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(adminService.getAllAdmins(actingUserId));
    }

    // Approve doctor
    @PostMapping("/doctors/{doctorUserId}/approve")
    public ResponseEntity<String> approveDoctor(@PathVariable Long doctorUserId, Authentication authentication) {
        Long actingAdminUserId = (Long) authentication.getPrincipal();
        adminService.approveDoctor(actingAdminUserId, doctorUserId);
        return ResponseEntity.ok("Doctor approved");
    }

    // Set user status
    @PostMapping("/users/{userId}/status")
    public ResponseEntity<String> setUserStatus(@PathVariable Long userId, @RequestBody Map<String, String> body, Authentication authentication) {
        Long actingAdminUserId = (Long) authentication.getPrincipal();
        String status = body.get("status");
        String name = adminService.setUserStatus(actingAdminUserId, userId, User.Status.valueOf(status));
        return ResponseEntity.ok(name + " status updated to " + status);
    }
    

    // View pending appointments
    @GetMapping("/appointments/pending")
    public ResponseEntity<List<AppointmentDTO>> viewPending() {
        List<AppointmentDTO> response = adminService.viewPendingAppointments().stream().map(AppointmentMapper::toDTO).toList();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/appointments/cancelled-by-doctor")
    public ResponseEntity<List<CancelledAppointmentDTO>> getDoctorCancelledAppointments() {
        List<CancelledAppointmentDTO> cancelled = cancelledAppointmentRepository.findAllByReassignedFalseOrderByCancelledAtDesc().stream()
            .map(cancelledAppointmentMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(cancelled);
    }

    // Approve appointment
    @PutMapping("/appointments/{appointmentId}/approve")
    public ResponseEntity<ApiResponse<AppointmentDTO>> approveAppointment(@PathVariable Long appointmentId, @Valid @RequestBody ScheduleRequest req, Authentication authentication) {
        try {
            Long actingAdminUserId = (Long) authentication.getPrincipal();
            Appointment appt = appointmentRepository.findById(appointmentId).orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
            if (!appointmentService.isLockedAndActive(appt)) {
                appt = appointmentService.acquireLock(appointmentId, actingAdminUserId);
            }
            // Validate date/time before scheduling
            appointmentService.validateSlotTime(req.getRequestedDateTime());
            Appointment saved = appointmentService.scheduleAppointment(appointmentId, actingAdminUserId, req.getDoctorUserId(), req.getRequestedDateTime());
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment approved and scheduled successfully.", AppointmentMapper.toDTO(saved)));
        } catch (ConflictException e) {
            log.error("Conflict approving appointment ID {}: {}", appointmentId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error approving appointment ID {}: {}", appointmentId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Error approving appointment: " + e.getMessage(), null));
        }
    }

    // Cancel appointment
    @PostMapping("/appointments/{appointmentId}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDTO>> cancelAppointment(@PathVariable Long appointmentId, @RequestBody CancelRequest req, Authentication authentication) {
        try {
            Long actingAdminUserId = (Long) authentication.getPrincipal();
            Appointment appt = appointmentRepository.findById(appointmentId).orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
            if (!appointmentService.isLockedAndActive(appt)) {
                appt = appointmentService.acquireLock(appointmentId, actingAdminUserId);
            }
            Appointment saved = appointmentService.cancelAppointment(appointmentId, actingAdminUserId, true, req);
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment cancelled by admin successfully.", AppointmentMapper.toDTO(saved)));
        } catch (Exception e) {
            log.error("Error canceling appointment ID {}: {}", appointmentId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Error canceling appointment: " + e.getMessage(), null));
        }
    }

    // Reassign appointment
    @PostMapping("/appointments/{appointmentId}/reassign")
    public ResponseEntity<ApiResponse<AppointmentDTO>> reassign(@PathVariable Long appointmentId, @Valid @RequestBody ReassignRequest req, Authentication authentication) {
        Long actingAdminUserId = (Long) authentication.getPrincipal();
        Appointment saved = adminService.reassignAppointment(actingAdminUserId, appointmentId, req.getNewDoctorUserId(), req.getRequestedDateTime());
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment re-assigned to Dr. " + saved.getDoctor().getUser().getFullName() + " successfully.", AppointmentMapper.toDTO(saved)));
    }
    @PutMapping("/appointments/{appointmentId}/archive")
    public ResponseEntity<ApiResponse<Void>> archiveAppointment(@PathVariable Long appointmentId, Authentication authentication) {
        try {
            Long actingAdminUserId = (Long) authentication.getPrincipal();
            Appointment appt = appointmentRepository.findById(appointmentId).orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
            if (!appt.getStatus().equals(Appointment.AppointmentStatus.CANCELLED)) {
                throw new ConflictException("Only cancelled appointments can be archived.");
            }
            appointmentRepository.delete(appt);
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment archived successfully.", null));
        } catch (ResourceNotFoundException e) {
            log.warn("Appointment not found for archiving: {}", appointmentId);
            return ResponseEntity.status(404).body(new ApiResponse<>(false, "Appointment not found.", null));
        } catch (ConflictException e) {
            log.error("Conflict archiving appointment ID {}: {}", appointmentId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Unexpected error archiving appointment ID {}: {}", appointmentId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "An unexpected error occurred. Please contact support.", null));
        }
    }

    
    @PutMapping("/appointments/reschedule")
    public ResponseEntity<ApiResponse<Void>> rescheduleAppointment(@RequestBody RescheduleRequest req, Authentication authentication) {
        try {
            Long actingAdminUserId = (Long) authentication.getPrincipal();
            appointmentService.rescheduleAppointment(req.getAppointmentId(), req.getNewRequestedDateTime(), req.getReason(), actingAdminUserId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment rescheduled successfully.", null));
        } catch (Exception e) {
            log.error("Error rescheduling appointment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "An unexpected error occurred. Please contact support.", null));
        }
    }
    @PutMapping("/appointments/reassign")
    public ResponseEntity<ApiResponse<Void>> reassignAppointment(@RequestBody ReassignRequest req, Authentication authentication) {
        try {
            Long actingAdminUserId = (Long) authentication.getPrincipal();
            appointmentService.reassignAppointment(req.getAppointmentId(), req.getNewDoctorUserId(), req.getRequestedDateTime(), req.getReason(), actingAdminUserId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment reassigned successfully.", null));
        } catch (Exception e) {
            log.error("Error reassigning appointment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "An unexpected error occurred. Please contact support.", null));
        }
    }

}