package com.medicare.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.medicare.dto.PatientAdminUpdateRequest;
import com.medicare.dto.PatientDTO;
import com.medicare.dto.PatientProfileUpdateRequest;
import com.medicare.dto.RegisterPatientRequest;
import com.medicare.entity.Patient;
import com.medicare.entity.User;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.mapper.MapPatient;
import com.medicare.repository.AdminRepository;
import com.medicare.repository.PatientRepository;
import com.medicare.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Patient createPatient(RegisterPatientRequest req) {
        if (userRepository.existsByEmailId(req.getEmailId())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.existsByPhoneNumber(req.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already in use");
        }

        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmailId(req.getEmailId());
        user.setPhoneNumber(req.getPhoneNumber());
        user.setPasswordHash(passwordEncoder.encode(req.getRawPassword()));
        user.setRole(User.Role.PATIENT);
        user.setStatus(User.Status.ACTIVE); // Admin created patients are active by default

        User savedUser = userRepository.save(user);

        Patient patient = new Patient();
        patient.setUser(savedUser);
        patient.setGender(req.getGender());
        patient.setDateOfBirth(req.getDateOfBirth());

        return patientRepository.save(patient);
    }

    @Transactional
    public Patient updatePatient(Long patientUserId, PatientAdminUpdateRequest req) {
    	
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        
        User user = patient.getUser();
        if (user.getRole() != User.Role.PATIENT)
            throw new ConflictException("User is not a patient");
        
        if (req.getFullName() != null && !req.getFullName().isBlank())
            user.setFullName(req.getFullName());

        if (req.getPhoneNumber() != null && !req.getPhoneNumber().isBlank())
            user.setPhoneNumber(req.getPhoneNumber());

        if (req.getStatus() != null)
            user.setStatus(req.getStatus());

        userRepository.save(user);

        return patientRepository.save(patient);
    }

    @Transactional
    public Patient updatePatientProfile(Long userId, PatientProfileUpdateRequest req) {
    	Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
    	
        User user = patient.getUser();
        
        if (req.getFullName() != null && !req.getFullName().isBlank())user.setFullName(req.getFullName());
        if (req.getEmailId() != null && !req.getEmailId().isBlank()) user.setEmailId(req.getEmailId());
        if (req.getPhoneNumber() != null && !req.getPhoneNumber().isBlank()) user.setPhoneNumber(req.getPhoneNumber());
        
        if (req.getRawPassword() != null && !req.getRawPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(req.getRawPassword()));
        }
        
        userRepository.save(user);
        return patientRepository.save(patient);

    }


    public Patient getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
    }
    
    public List<PatientDTO> getAllPatients() {
    	List<PatientDTO> listPatients = patientRepository.findAll()
    			.stream()
    			.map(MapPatient::toDTO)
    			.toList();
        return listPatients;
    }

    @Transactional
    public void blockPatient(Long adminUserId, Long patientUserId) {
        // Validate admin
        adminRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can delete patients"));

        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // Soft delete
        User user = patient.getUser();
        user.setStatus(User.Status.BLOCKED);
        userRepository.save(user);
    }
    
    @Transactional
    public void deletePatient(Long adminUserId, Long patientUserId) {
        // Validate admin
        adminRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can delete patients"));

        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // Soft delete
        User user = patient.getUser();
        
        patientRepository.delete(patient);
        userRepository.delete(user);
    }

}