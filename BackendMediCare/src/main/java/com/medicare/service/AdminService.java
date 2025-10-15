package com.medicare.service;

import com.medicare.dto.AdminRegistrationRequest;
import com.medicare.entity.*;
import com.medicare.repository.*;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * AdminService: admin features described in story.
 * - Only super-admin can create other admins (AuthService handles creation, but this service exposes admin actions)
 * - Approve/block doctors
 * - View PENDING appointments (non-reconsult)
 * - Reassign appointment when doctor cancels (admin flow)
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;
    private final LockService lockService;
    private final AvailabilityRepository availabilityRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleMeetService googleMeetService;


    /**
     * Approve a doctor (set doctor's user status to ACTIVE). Only admins may call this.
     */
    @Transactional
    public void approveDoctor(Long actingAdminUserId, Long doctorUserId) {
        Admin acting = adminRepository.findByUserId(actingAdminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can approve doctors"));

        if (!acting.getUser().getStatus().equals(User.Status.ACTIVE)) {
            throw new ForbiddenException("Acting admin is not active");
        }

        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        User user = doctor.getUser();
        if (user.getStatus() == User.Status.ACTIVE) {
            throw new ConflictException("Doctor is already active");
        }

        user.setStatus(User.Status.ACTIVE);
        userRepository.save(user);

        // ✅ Send Doctor Approval Email instead of AppointmentScheduledEmail
        emailService.sendDoctorApprovedEmail(
                user.getEmailId(),
                user.getFullName(),
                doctor.getSpecialization().name()
        );
    }


    /**
     * Block/unblock a user (admin action).
     */
    @Transactional
    public void setUserStatus(Long actingAdminUserId, Long targetUserId, User.Status status) {
        Admin acting = adminRepository.findByUserId(actingAdminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can set user status"));
        if (!acting.getUser().getStatus().equals(User.Status.ACTIVE)) {
            throw new ForbiddenException("Acting admin is not active");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
    }

    /**
     * View pending appointments (exclude reconsults).
     */
    @Transactional(readOnly = true)
    public List<Appointment> viewPendingAppointments() {
        return appointmentRepository.findByStatus(Appointment.AppointmentStatus.PENDING);
    }

    /**
     * Reassign a confirmed appointment to another doctor (admin action).
     * - Ensures slot availability and specialization match.
     * - Refund/reschedule flow handled by caller if necessary.
     */
    @Transactional
    public Appointment reassignAppointment(Long actingAdminUserId, Long appointmentId, Long newDoctorUserId, Long newAvailabilityId) {
        // ensure admin
        adminRepository.findByUserId(actingAdminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can reassign appointments"));

        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Acquire lock checks: ensure nobody else is working
        if (lockService.isLockedAndActive(appt)) {
            throw new ConflictException("Appointment currently locked by another user");
        }
        lockService.applyLock(appt, actingAdminUserId);

        // free previous slot (if present)
        if (appt.getScheduledDateTime() != null && appt.getDoctor() != null) {
            List<Availability> prev = availabilityRepository
                    .findByDoctorUserUserIdAndDate(appt.getDoctor().getUser().getUserId(), appt.getScheduledDateTime().toLocalDate());
            for (Availability s : prev) {
                if (s.getStartTime().equals(appt.getScheduledDateTime().toLocalTime())) {
                    s.setBooked(false);
                    availabilityRepository.save(s);
                    break;
                }
            }
        }

        // assign new doctor & slot
        Doctor newDoctor = doctorRepository.findByUserId(newDoctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        if (!newDoctor.getSpecialization().equals(appt.getSpecialization())) {
            throw new ConflictException("New doctor specialization mismatch");
        }
        Availability newSlot = availabilityRepository.findById(newAvailabilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));
        if (newSlot.isBooked()) throw new ConflictException("Slot already booked");
        if (!newSlot.getDoctor().getUser().getUserId().equals(newDoctorUserId)) throw new ConflictException("Slot doesn't belong to chosen doctor");

        newSlot.setBooked(true);
        availabilityRepository.save(newSlot);

        appt.setDoctor(newDoctor);
        appt.setScheduledDateTime(java.time.LocalDateTime.of(newSlot.getDate(), newSlot.getStartTime()));
        String meetLink;
        try {
            meetLink = googleMeetService.createGoogleMeetEvent(
                "Consultation with Dr. " + appt.getDoctor().getUser().getFullName(),
                "Appointment reassigned via MediCare HMS",
                appt.getScheduledDateTime(),
                30 // Duration in minutes
            );
            appt.setMeetingLink(meetLink);
        } catch (Exception e) {
            throw new ConflictException("Could not generate Google Meet link for reassigned appointment: " + e.getMessage());
        }
        // release lock and persist
        lockService.releaseLock(appt);
        Appointment saved = appointmentRepository.save(appt);

        // notify parties
        emailService.sendAppointmentRescheduledEmail(saved.getPatient().getUser().getEmailId(),
                saved.getPatient().getUser().getFullName(),
                null, saved.getScheduledDateTime(), saved.getMeetingLink());

        emailService.sendAppointmentRescheduledEmail(saved.getDoctor().getUser().getEmailId(),
                saved.getDoctor().getUser().getFullName(),
                null, saved.getScheduledDateTime(), saved.getMeetingLink());

        return saved;
    }
    
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    @Transactional
    public Admin createAdmin(Long actingAdminUserId, AdminRegistrationRequest req) {
        Admin acting = adminRepository.findByUserId(actingAdminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can create admin"));

        if (!acting.isSuperAdmin()) {
            throw new ForbiddenException("Only Super Admin can create another Admin");
        }

        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmailId(req.getEmail());
        user.setPhoneNumber(req.getPhoneNumber());
        user.setPasswordHash(passwordEncoder.encode(req.getRawPassword()));
        user.setRole(User.Role.ADMIN);
        user.setStatus(User.Status.ACTIVE);
        userRepository.save(user);

        Admin newAdmin = new Admin();
        newAdmin.setUser(user);
        newAdmin.setSuperAdmin(req.isSuperAdmin());
        return adminRepository.save(newAdmin);
    }
    
    @Transactional
    public Admin updateAdmin(Long actingAdminUserId, Long targetAdminUserId, AdminRegistrationRequest req) {
        Admin acting = adminRepository.findByUserId(actingAdminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can update admins"));

        if (!acting.isSuperAdmin()) {
            throw new ForbiddenException("Only Super Admin can update another Admin");
        }

        Admin target = adminRepository.findByUserId(targetAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        User user = target.getUser();
        user.setFullName(req.getFullName());
        user.setEmailId(req.getEmail());
        user.setPhoneNumber(req.getPhoneNumber());
        if (req.getRawPassword() != null && !req.getRawPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(req.getRawPassword()));
        }

        userRepository.save(user);

        target.setSuperAdmin(req.isSuperAdmin());

        return adminRepository.save(target);
    }


    @Transactional
    public void blockAdmin(Long actingAdminUserId, Long targetAdminUserId) {
        Admin acting = adminRepository.findByUserId(actingAdminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can block admins"));

        if (!acting.isSuperAdmin()) {
            throw new ForbiddenException("Only Super Admin can delete block Admin");
        }

        Admin target = adminRepository.findByUserId(targetAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (target.isSuperAdmin()) {
            throw new ConflictException("Cannot delete Super Admin");
        }

        User user = target.getUser();
        user.setStatus(User.Status.BLOCKED);
        userRepository.save(user);
    }
    
    @Transactional
    public void deleteAdmin(Long actingAdminUserId, Long targetAdminUserId) {
        Admin acting = adminRepository.findByUserId(actingAdminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can delete admins"));

        if (!acting.isSuperAdmin()) {
            throw new ForbiddenException("Only Super Admin can delete another Admin");
        }

        Admin target = adminRepository.findByUserId(targetAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        
        if (target.isSuperAdmin()) {
            throw new ConflictException("Cannot delete Super Admin");
        }


        User user = target.getUser();
        userRepository.delete(user);
    }

}
