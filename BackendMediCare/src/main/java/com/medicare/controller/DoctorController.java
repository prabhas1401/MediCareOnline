package com.medicare.controller;

import java.util.List;

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
import com.medicare.dto.AppointmentDTO;
import com.medicare.dto.DoctorProfileUpdateRequest;
import com.medicare.dto.PatientAdminUpdateRequest;
import com.medicare.dto.PatientDTO;
import com.medicare.dto.ReconsultScheduleRequest;
import com.medicare.dto.RegisterPatientRequest;
import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;
import com.medicare.entity.DoctorLeave;
import com.medicare.entity.Patient;
import com.medicare.exception.ForbiddenException;
import com.medicare.mapper.AppointmentMapper;
import com.medicare.mapper.MapPatient;
import com.medicare.repository.DoctorRepository;
import com.medicare.service.AppointmentService;
import com.medicare.service.DoctorLeaveService;
import com.medicare.service.DoctorService;
import com.medicare.service.PatientService;

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
	private final PatientService patientService;
	private final DoctorRepository doctorRepository;
	private final DoctorLeaveService doctorLeaveService;


    // ---------- Doctor updates their profile ----------
    @PutMapping("/profile")				//Done
    public ResponseEntity<ApiResponse<Doctor>> updateProfile(@Valid @RequestBody DoctorProfileUpdateRequest req,
                                                Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        doctorRepository.findByUserId(userId)
        .orElseThrow(() -> new ForbiddenException("Only doctors can update their profile"));
        Doctor saved = doctorService.updateOwnProfile(userId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully.", null));
    }

    // ---------- Create / Update Patient record (Doctor-managed CRUD) ----------
    @PostMapping("/patients")			//Done
    public ResponseEntity<ApiResponse<Patient>> createPatient(@Valid @RequestBody RegisterPatientRequest req,
            													Authentication authentication) {
    	
        Long doctorUserId = (Long) authentication.getPrincipal();
        doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ForbiddenException("Only doctors can create patients")); 
        
        Patient saved = patientService.createPatient(req);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Patient created by doctor successfully.", null));
    }

    @PutMapping("/patient/{patientUserId}")		//Done
    public ResponseEntity<ApiResponse<Patient>> updatePatient(@PathVariable Long patientUserId,
    											@Valid @RequestBody PatientAdminUpdateRequest req,
                                                 Authentication authentication) {
    	
        Long doctorUserId = (Long) authentication.getPrincipal();
        doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ForbiddenException("Only doctors can update patients"));        

        Patient updated = patientService.updatePatient(patientUserId, req);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient updated by doctor successfully.", null));
    }

    @GetMapping("/patient/{patientUserId}")			//Done
    public ResponseEntity<PatientDTO> getPatient(@PathVariable Long patientUserId) {
        Patient patient = doctorService.getPatient(patientUserId);
        return ResponseEntity.ok(MapPatient.toDTO(patient));
    }
    
    @PostMapping("/reconsult/{id}/schedule")			//Done
    public ResponseEntity<ApiResponse<AppointmentDTO>> scheduleReconsult(@PathVariable("id") Long reconsultId,
                                                         @Valid @RequestBody ReconsultScheduleRequest req,
                                                         Authentication authentication) {
        Long actingUserId = (Long) authentication.getPrincipal();
        Appointment saved = appointmentService.scheduleReconsult(reconsultId, actingUserId, req.getNewRequestedDateTime());
        return ResponseEntity.ok(new ApiResponse<>(true, "Re-consult appointment scheduled successfully.", AppointmentMapper.toDTO(saved)));
    }
    
    @PostMapping("/reconsult/{reconsultId}/reschedule")		//Done
    public ResponseEntity<ApiResponse<AppointmentDTO>> rescheduleReconsult(
            @PathVariable Long reconsultId,
            @Valid @RequestBody ReconsultScheduleRequest req,
            Authentication authentication) {
    	Long doctorUserId = (Long) authentication.getPrincipal();
    	Appointment updated = appointmentService.rescheduleReconsult(reconsultId, doctorUserId, req.getNewRequestedDateTime());
        return ResponseEntity.ok(new ApiResponse<>(true, "Re-consult appointment re-scheduled successfully.", AppointmentMapper.toDTO(updated)));
    }

    // ---------- Leaves ----------
    @PostMapping("/leaves")				//Done
    public ResponseEntity<ApiResponse<DoctorLeave>> addLeave(@Valid @RequestBody AddLeaveRequest req,
                                                Authentication authentication) {
        Long doctorUserId = (Long) authentication.getPrincipal();
        doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ForbiddenException("Doctor not found"));     
        DoctorLeave saved = doctorLeaveService.addLeave(doctorUserId, req);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Doctor Leave updated successfully.", saved));
    }
    
    @GetMapping("/appointments/pending")		//Done
    public ResponseEntity<List<AppointmentDTO>> viewPendingForDoctor(Authentication authentication) {
    	Long doctorUserId = (Long) authentication.getPrincipal();
        List<AppointmentDTO> response = doctorService.getPendingAppointmentsForDoctor(doctorUserId)
                .stream()
                .map(AppointmentMapper::toDTO)
                .toList();
        return ResponseEntity.ok(response);
    }
}