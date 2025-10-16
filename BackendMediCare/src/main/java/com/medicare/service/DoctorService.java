package com.medicare.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medicare.dto.DoctorProfileUpdateRequest;
import com.medicare.dto.RegisterRequest;
import com.medicare.entity.Availability;
import com.medicare.entity.Doctor;
import com.medicare.entity.DoctorLeave;
import com.medicare.entity.Patient;
import com.medicare.entity.User;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.AdminRepository;
import com.medicare.repository.DoctorRepository;
import com.medicare.repository.PatientRepository;
import com.medicare.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * DoctorService: manages doctor profile, patient CRUD (doctor can create/manage patients),
 * and delegates availability & leave operations to AvailabilityService & DoctorLeaveService.
 */
@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final AvailabilityService availabilityService;
    private final DoctorLeaveService doctorLeaveService;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

 // Doctor updates own profile
    @Transactional
    public Doctor updateOwnProfile(Long doctorUserId, DoctorProfileUpdateRequest req) {
        return updateDoctorProfileInternal(doctorUserId, req);
    }

    // ---------- Admin creates a new doctor ----------
    @Transactional
    public Doctor createDoctorAsAdmin(Long adminUserId, RegisterRequest req) {
        // validate admin
        User actingAdmin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        if (actingAdmin.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Only admins can create doctors");
        }

        // create new user for doctor
        User newUser = new User();
        newUser.setFullName(req.getFullName());
        newUser.setEmailId(req.getEmailId());
        newUser.setPhoneNumber(req.getPhoneNumber());
        newUser.setPasswordHash(passwordEncoder.encode(req.getRawPassword()));
        newUser.setRole(User.Role.DOCTOR);
        newUser.setStatus(User.Status.ACTIVE); // active because admin is creating doctor
        userRepository.save(newUser);

        // create doctor profile
        Doctor doctor = new Doctor();
        doctor.setUser(newUser);
        doctor.setQualification(req.getQualification());
        doctor.setExperienceYears(req.getExperienceYears());
        doctor.setSpecialization(Doctor.Specialization.valueOf(req.getSpecialization()));
        return doctorRepository.save(doctor);
    }

    // ---------- Admin updates existing doctor ----------
    @Transactional
    public Doctor updateDoctorAsAdmin(Long adminUserId, Long doctorUserId, DoctorProfileUpdateRequest req) {
        User actingAdmin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        if (actingAdmin.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Only admins can update doctors");
        }
        return updateDoctorProfileInternalAsAdmin(doctorUserId, req);
    }

    // ---------- Internal helpers for updating a doctor profile self and by admin----------
    private Doctor updateDoctorProfileInternal(Long doctorUserId, DoctorProfileUpdateRequest req) {
        User user = userRepository.findById(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user not found"));
        if (user.getRole() != User.Role.DOCTOR) {
            throw new ConflictException("User is not a doctor");
        }

        // ✅ Update User fields
        user.setFullName(req.getFullName());
        user.setEmailId(req.getEmailId());
        user.setPhoneNumber(req.getPhoneNumber());
        user.setPasswordHash(passwordEncoder.encode(req.getRawPassword()));
        userRepository.save(user);

        // ✅ Update Doctor fields
        Doctor existing = doctorRepository.findByUserId(doctorUserId).orElse(new Doctor());
        existing.setUser(user);
        existing.setQualification(req.getQualification());
        existing.setExperienceYears(req.getExperienceYears());
        existing.setSpecialization(Doctor.Specialization.valueOf(req.getSpecialization()));
        return doctorRepository.save(existing);
    }
    
    private Doctor updateDoctorProfileInternalAsAdmin(Long doctorUserId, DoctorProfileUpdateRequest req) {
        User user = userRepository.findById(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user not found"));
        if (user.getRole() != User.Role.DOCTOR) {
            throw new ConflictException("User is not a doctor");
        }

        // Update User fields allowed for admin, but NOT password or email
        user.setFullName(req.getFullName());
        user.setPhoneNumber(req.getPhoneNumber());
        user.setStatus(req.getStatus());
        userRepository.save(user);

        // Update Doctor fields
        Doctor existing = doctorRepository.findByUserId(doctorUserId).orElse(new Doctor());
        existing.setUser(user);
        existing.setQualification(req.getQualification());
        existing.setExperienceYears(req.getExperienceYears());
        existing.setSpecialization(Doctor.Specialization.valueOf(req.getSpecialization()));
        return doctorRepository.save(existing);
    }


    public List<Doctor> findBySpecializationAndActive(Doctor.Specialization spec) {
        return doctorRepository.findBySpecializationAndUserStatus(spec, User.Status.ACTIVE);
    }

    // Doctor-managed patient create/update
    @Transactional
    public Patient createOrUpdatePatientRecord(Long doctorUserId, Patient payload) {
        doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        User user = userRepository.findById(payload.getUser().getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() != User.Role.PATIENT) throw new ConflictException("User must be patient");

        Patient p = patientRepository.findByUserId(user.getUserId()).orElse(new Patient());
        p.setUser(user);
        p.setGender(payload.getGender());
        p.setDateOfBirth(payload.getDateOfBirth());
        return patientRepository.save(p);
    }

    public Patient getPatient(Long patientUserId) {
        return patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
    }

    public Availability addAvailability(Long doctorUserId, Availability slot) {
        return availabilityService.createSlot(doctorUserId, slot);
    }

    public DoctorLeave addLeave(Long doctorUserId, LocalDate date, String reason) {
        return doctorLeaveService.addLeave(doctorUserId, date, reason);
    }
    
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @Transactional
    public void blockDoctor(Long adminUserId, Long doctorUserId) {
        // Validate admin
        adminRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can delete doctors"));

        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        // Soft delete → mark user as BLOCKED instead of removing from DB
        User user = doctor.getUser();
        user.setStatus(User.Status.BLOCKED);
        userRepository.save(user);
    }
    
    @Transactional
    public void deleteDoctor(Long adminUserId, Long doctorUserId) {
        // Validate admin
        adminRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can delete doctors"));

        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        User user = doctor.getUser();
        userRepository.delete(user);
    }

}

