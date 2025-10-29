package com.medicare.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medicare.dto.AdminDTO;
import com.medicare.dto.AdminRegistrationRequest;
import com.medicare.entity.Admin;
import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;
import com.medicare.entity.User;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.AdminRepository;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.AvailabilityRepository;
import com.medicare.repository.CancelledAppointmentRepository;
import com.medicare.repository.DoctorLeaveRepository;
import com.medicare.repository.DoctorRepository;
import com.medicare.repository.UserRepository;

import lombok.RequiredArgsConstructor;

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
    private final EmailService emailService;
    private final LockService lockService;
    private final AvailabilityRepository availabilityRepository;
    private final PasswordEncoder passwordEncoder;
	private final DoctorLeaveRepository doctorLeaveRepository;
	private final AppointmentService appointmentService;
	private final ZoomService zoomService;
	private final CancelledAppointmentRepository cancelledAppointmentRepository;


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
    public String setUserStatus(Long actingAdminUserId, Long targetUserId, User.Status status) {
        Admin acting = adminRepository.findByUserId(actingAdminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can set user status"));
        if (!acting.getUser().getStatus().equals(User.Status.ACTIVE)) {
            throw new ForbiddenException("Acting admin is not active");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
        return user.getFullName();
    }

    /**
     * View pending appointments (exclude reconsults).
     */
    @Transactional(readOnly = true)
    public List<Appointment> viewPendingAppointments() {
        return appointmentRepository.findByStatusAndIsReconsultFalse(Appointment.AppointmentStatus.PENDING);
    }

    /**
     * Reassign a confirmed appointment to another doctor (admin action).
     * - Ensures slot availability and specialization match.
     * - Refund/reschedule flow handled by caller if necessary.
     */
   
    @Transactional
    public Appointment reassignAppointment(Long actingAdminUserId,
                                           Long appointmentId,
                                           Long newDoctorUserId,
                                           LocalDateTime requestedDateTime) {

        // 1. Ensure acting user is admin
        adminRepository.findByUserId(actingAdminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can reassign appointments"));

        // 2. Load appointment
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // 3. Acquire lock
        if (!lockService.isLockedAndActive(appt)) {
            throw new ConflictException("Appointment is not locked. Please acquire lock before reassigning.");
        }

        if (!appt.getLockedBy().equals(actingAdminUserId)) {
            throw new ConflictException("Appointment currently locked by another user.");
        }

        // 4. Validate new doctor
        Doctor newDoctor = doctorRepository.findByUserId(newDoctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        if (!newDoctor.getSpecialization().equals(appt.getSpecialization())) {
            throw new ConflictException("New doctor specialization mismatch");
        }

        // 5. Validate requested datetime
        if (!requestedDateTime.isAfter(LocalDateTime.now())) {
            throw new ConflictException("Requested slot must be in the future");
        }
        appointmentService.validateSlotTime(requestedDateTime);

        // 6. Check doctor leave
        if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(newDoctorUserId, requestedDateTime.toLocalDate())) {
            throw new ConflictException("Doctor is on leave that date");
        }

        // 7. Check conflicts: another appointment at same datetime
        if (appointmentRepository.existsByDoctorUserUserIdAndScheduledDateTime(newDoctorUserId, requestedDateTime)) {
            throw new ConflictException("Requested slot already booked");
        }

        // 8. Check blocked slots
        boolean blocked = availabilityRepository.existsByDoctorUserUserIdAndDateAndStartTimeAndBlockedTrue(
                newDoctorUserId, requestedDateTime.toLocalDate(), requestedDateTime.toLocalTime());
        if (blocked) throw new ConflictException("Requested slot is blocked/unavailable");

        // 9. Update appointment
        LocalDateTime oldDateTime = appt.getScheduledDateTime();
        appt.setDoctor(newDoctor);
        appt.setScheduledDateTime(requestedDateTime);
        appt.setReAssigned(true);
        appt.setStatus(Appointment.AppointmentStatus.CONFIRMED);

        // 10. Generate Google Meet link
        try {
        	String meetLink = zoomService.createZoomMeeting(
                    "Consultation with Dr. " + appt.getDoctor().getUser().getFullName(),
                    requestedDateTime,
                    20
            );
            appt.setMeetingLink(meetLink);
        } catch (Exception e) {
            throw new ConflictException("Could not generate Zoom link for reassigned appointment: " + e.getMessage());
        }
        
        cancelledAppointmentRepository.findByAppointmentAppointmentId(appointmentId)
        .ifPresent(c -> {
            c.setReassigned(true);
            cancelledAppointmentRepository.save(c);
        });


        lockService.releaseLock(appt);
        Appointment saved = appointmentRepository.save(appt);

        // 11. Notify parties
        emailService.sendAppointmentRescheduledEmail(
                saved.getPatient().getUser().getEmailId(),
                saved.getPatient().getUser().getFullName(),
                oldDateTime,
                saved.getScheduledDateTime(),
                saved.getMeetingLink()
        );

        emailService.sendAppointmentRescheduledEmail(
                saved.getDoctor().getUser().getEmailId(),
                saved.getDoctor().getUser().getFullName(),
                oldDateTime,
                saved.getScheduledDateTime(),
                saved.getMeetingLink()
        );

        return saved;
    }
    
    public List<AdminDTO> getAllAdmins(Long adminUserId) {
    	
    	Admin actingAdmin = adminRepository.findByUserId(adminUserId)
    			.orElseThrow(() -> new ResourceNotFoundException("Admin not found."));
    	
    	if(!actingAdmin.isSuperAdmin())
    		throw new ForbiddenException("Only super admin can get all admins.");
    	
        return adminRepository.findAll()
        		.stream()
        		.map(admin -> {
        			AdminDTO dto = new AdminDTO(
        					admin.getUser().getUserId(),
        					admin.getUser().getFullName(),
        					admin.getUser().getEmailId(),
        					admin.getUser().getPhoneNumber(),
        					admin.getUser().getStatus(),
        					admin.getUser().getCreatedAt(),
        					admin.getUser().getUpdatedAt(),
        					admin.isSuperAdmin()        					
        					);
        			return dto;
        		})
        		.toList();
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
        
        if(req.getFullName() != null && !req.getFullName().isBlank())
        	user.setFullName(req.getFullName());
        if(req.getEmail() != null && !req.getEmail().isBlank())
        	user.setEmailId(req.getEmail());
        if(req.getPhoneNumber() != null && !req.getPhoneNumber().isBlank())
        	user.setPhoneNumber(req.getPhoneNumber());
        if (req.getRawPassword() != null && !req.getRawPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(req.getRawPassword()));
        }

        userRepository.save(user);
        
        target.setSuperAdmin(req.isSuperAdmin());

        return adminRepository.save(target);
    }


    @Transactional
    public String blockAdmin(Long actingAdminUserId, Long targetAdminUserId) {
        Admin acting = adminRepository.findByUserId(actingAdminUserId)
                .orElseThrow(() -> new ForbiddenException("Only admins can block admins"));

        if (!acting.isSuperAdmin()) {
            throw new ForbiddenException("Only Super Admin can delete block Admin");
        }

        Admin target = adminRepository.findByUserId(targetAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (target.isSuperAdmin()) {
            throw new ConflictException("Cannot block Super Admin");
        }

        User user = target.getUser();
        user.setStatus(User.Status.BLOCKED);
        userRepository.save(user);
        return user.getFullName();
    }
    
    @Transactional
    public String deleteAdmin(Long actingAdminUserId, Long targetAdminUserId) {
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
        adminRepository.delete(target);
        
        String name=user.getFullName();
        userRepository.delete(user);
        
        return name;
    }

}