package com.medicare.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medicare.dto.DoctorDTO;
import com.medicare.dto.DoctorProfileUpdateRequest;
import com.medicare.dto.RegisterRequest;
import com.medicare.entity.Appointment;
import com.medicare.entity.Availability;
import com.medicare.entity.Doctor;
import com.medicare.entity.DoctorLeave;
import com.medicare.entity.Patient;
import com.medicare.entity.User;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.mapper.MapDoctor;
import com.medicare.repository.AdminRepository;
import com.medicare.repository.AppointmentRepository;
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
	private final AppointmentRepository appointmentRepository;
    
    public Doctor getDoctorEntity(Long doctorUserId) {
        return doctorRepository.findByUserId(doctorUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
    }

 // Doctor updates own profile
    @Transactional
    public Doctor updateOwnProfile(Long doctorUserId, DoctorProfileUpdateRequest req) {
        User user = userRepository.findById(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user not found"));
        
        if (user.getRole() != User.Role.DOCTOR)
            throw new ConflictException("User is not a doctor");
        
        if (req.getFullName() != null && !req.getFullName().isBlank())
            user.setFullName(req.getFullName());
        if (req.getEmailId() != null && !req.getEmailId().isBlank())
            user.setEmailId(req.getEmailId());
        if (req.getPhoneNumber() != null && !req.getPhoneNumber().isBlank())
            user.setPhoneNumber(req.getPhoneNumber());
        if (req.getRawPassword() != null && !req.getRawPassword().isBlank())
            user.setPasswordHash(passwordEncoder.encode(req.getRawPassword()));
        
        userRepository.save(user);

        // ✅ Update Doctor entity
        Doctor existing = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        existing.setUser(user);

        if (req.getQualification() != null && !req.getQualification().isBlank())
            existing.setQualification(req.getQualification());

        if (req.getExperienceYears() > 0)
            existing.setExperienceYears(req.getExperienceYears());

        if (req.getSpecialization() != null && !req.getSpecialization().isBlank()) {
            try {
                existing.setSpecialization(Doctor.Specialization.valueOf(req.getSpecialization().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ConflictException("Invalid specialization value: " + req.getSpecialization());
            }
        }

        return doctorRepository.save(existing);
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

    private Doctor updateDoctorProfileInternalAsAdmin(Long doctorUserId, DoctorProfileUpdateRequest req) {
        User user = userRepository.findById(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user not found"));
        if (user.getRole() != User.Role.DOCTOR) {
            throw new ConflictException("User is not a doctor");
        }

        if(req.getFullName() != null && !req.getFullName().isBlank())
        	user.setFullName(req.getFullName());
        if(req.getPhoneNumber() != null && !req.getPhoneNumber().isBlank())
        	user.setPhoneNumber(req.getPhoneNumber());
        if(req.getStatus() != null)
        	user.setStatus(req.getStatus());
        
        userRepository.save(user);

        Doctor existing = doctorRepository.findByUserId(doctorUserId).orElse(new Doctor());
        existing.setUser(user);
        
        if(req.getQualification() != null && !req.getQualification().isBlank())
        	existing.setQualification(req.getQualification());
        
        if(req.getExperienceYears() > 0)
        	existing.setExperienceYears(req.getExperienceYears());
        
        if (req.getSpecialization() != null && !req.getSpecialization().isBlank()) {
            try {
                existing.setSpecialization(Doctor.Specialization.valueOf(req.getSpecialization().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ConflictException("Invalid specialization value: " + req.getSpecialization());
            }
        }
        
        return doctorRepository.save(existing);
    }


    public List<Doctor> findBySpecializationAndActive(Doctor.Specialization spec, Long adminUserId) {
    	
        User actingAdmin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        if (actingAdmin.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Only admins can see "+spec+" doctors");
        }
        return doctorRepository.findBySpecializationAndUserStatus(spec, User.Status.ACTIVE);
    }

    public Patient getPatient(Long patientUserId) {
        return patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
    }
    
    public List<DoctorDTO> getAllDoctors() {
        return doctorRepository.findAll()
                .stream()
                .map(MapDoctor::toDTO)
                .collect(Collectors.toList());
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
        
        if(doctor.getAppointments()!=null && !doctor.getAppointments().isEmpty()) {
        	throw new ConflictException("Cannot delete a doctor with appointments.");
        }

        User user = doctor.getUser();
        doctorRepository.delete(doctor);
        userRepository.delete(user);
    }
    

	public List<Appointment> getPendingAppointmentsForDoctor(Long doctorUserId) {
		Doctor doctor = doctorRepository.findByUserId(doctorUserId)
				.orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
		
		
        return appointmentRepository.findByStatusAndSpecializationAndIsReconsultFalse(
        		Appointment.AppointmentStatus.PENDING,
                doctor.getSpecialization()
        );
	}

}

