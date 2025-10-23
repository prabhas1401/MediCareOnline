package com.medicare.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.medicare.dto.CancelRequest;
import com.medicare.dto.CreateAppointmentRequest;
import com.medicare.entity.Appointment;
import com.medicare.entity.CancelledAppointment;
import com.medicare.entity.Doctor;
import com.medicare.entity.Patient;
import com.medicare.entity.Payment;
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
import com.medicare.repository.PatientRepository;
import com.medicare.repository.PaymentRepository;
import com.medicare.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AvailabilityRepository availabilityRepository;
    private final DoctorLeaveRepository doctorLeaveRepository;
    private final PaymentRepository paymentRepository;
    private final LockService lockService;
    private final EmailService emailService;
	private final ZoomService zoomService;
	private final AdminRepository adminRepository;
	private final CancelledAppointmentRepository cancelledAppointmentRepository;
	private final UserRepository userRepository;
    

    /**
     * Create appointment request (PENDING). Controller should ensure payment happened.
     */
    @Transactional
    public Appointment createAppointmentRequest(Long patientUserId, CreateAppointmentRequest req) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Appointment appt = new Appointment();
        appt.setPatient(patient);
        appt.setSpecialization(req.getSpecialization());
        appt.setSymptoms(req.getSymptoms());
        appt.setAdditionalSymptoms(req.getAdditionalSymptoms());
        appt.setPreferredDate(req.getPreferredDate());
        appt.setFee(req.getFeePaid());
        appt.setStatus(Appointment.AppointmentStatus.PENDING);
        return appointmentRepository.save(appt);
    }

    /**
     * Acquire a full lock on appointment for actingUserId.
     */
    @Transactional
    public Appointment acquireLock(Long appointmentId, Long actingUserId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (lockService.isLockedAndActive(appt) && !actingUserId.equals(appt.getLockedBy())) {
            throw new ConflictException("Another user is currently processing this appointment.");
        }

        if (appt.getLockedBy() != null && lockService.isLockExpired(appt)) {
            lockService.releaseLock(appt);
        }

        lockService.applyLock(appt, actingUserId);
        return appointmentRepository.save(appt);
    }

    @Transactional
    public void releaseLock(Long appointmentId, Long actingUserId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appt.getLockedBy() == null) return;
        if (!appt.getLockedBy().equals(actingUserId)) throw new ForbiddenException("Only lock owner may release");
        lockService.releaseLock(appt);
        appointmentRepository.save(appt);
    }

    /**
     * Schedule PENDING appointment to a doctor by using availability slot.
     */
    @Transactional
    public Appointment scheduleAppointment(Long appointmentId, Long actingUserId, Long doctorUserId, LocalDateTime requestedDateTime) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        
        

        // require lock
        if (!lockService.isLockedAndActive(appt)) {
            throw new ConflictException("Appointment is not locked. Please acquire lock before scheduling.");
        }

        if (!appt.getLockedBy().equals(actingUserId)) {
            throw new ConflictException("Appointment currently locked by another user.");
        }
        if (appt.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new ConflictException("Only pending appointments can be scheduled");
        }

        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        
        if (!requestedDateTime.isAfter(LocalDateTime.now())) {
            throw new ConflictException("Requested slot must be in the future");
        }
        
        validateSlotTime(requestedDateTime);
        
        if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(doctorUserId, requestedDateTime.toLocalDate())) {
            throw new ConflictException("Doctor is on leave that date");
        }
        
        if (appointmentRepository.existsByDoctorUserUserIdAndScheduledDateTime(doctorUserId, requestedDateTime)) {
            throw new ConflictException("Slot already booked");
        }


        boolean blocked = availabilityRepository.existsByDoctorUserUserIdAndDateAndStartTimeAndBlockedTrue(
                doctorUserId, requestedDateTime.toLocalDate(), requestedDateTime.toLocalTime());
        if (blocked) throw new ConflictException("Slot marked unavailable by doctor");

        appt.setDoctor(doctor);
        appt.setScheduledDateTime(requestedDateTime);
        appt.setStatus(Appointment.AppointmentStatus.CONFIRMED);

        try {
            String meetingLink = zoomService.createZoomMeeting(
                "Consultation with Dr. " + appt.getDoctor().getUser().getFullName(),
                appt.getScheduledDateTime(),
                20
            );
            appt.setMeetingLink(meetingLink);
        } catch (Exception e) {
            throw new ConflictException("Could not generate Zoom link: " + e.getMessage());
        }

        // release lock after scheduling
        lockService.releaseLock(appt);
        Appointment saved = appointmentRepository.save(appt);

        // notify patient + doctor
        emailService.sendAppointmentScheduledEmail(saved.getPatient().getUser().getEmailId(),
                saved.getPatient().getUser().getFullName(),
                saved.getDoctor().getUser().getFullName(),
                saved.getSpecialization().name(),
                saved.getScheduledDateTime(),
                saved.getMeetingLink());

        emailService.sendAppointmentScheduledEmail(saved.getDoctor().getUser().getEmailId(),
                saved.getDoctor().getUser().getFullName(),
                saved.getDoctor().getUser().getFullName(),
                saved.getSpecialization().name(),
                saved.getScheduledDateTime(),
                saved.getMeetingLink());

        return saved;
    }
    
    /**
     * Ensure requested slot aligns with 20-min slot boundaries and not during lunch.
     */
    public void validateSlotTime(LocalDateTime dt) {
        LocalTime t = dt.toLocalTime();
        LocalTime start = LocalTime.of(9, 0);
        LocalTime end = LocalTime.of(17, 0);
        if (dt.getMinute() % 20 != 0) throw new ConflictException("Slot must align to 20-minute boundary (e.g., 09:00, 09:20)");
        if (t.isBefore(start) || t.isAfter(end.minusMinutes(20))) throw new ConflictException("Slot outside working hours");
        if (!t.isBefore(LocalTime.of(12, 0)) && t.isBefore(LocalTime.of(13, 0))) throw new ConflictException("Slot during lunch break");
    }

    /**
     * Reschedule appointment (1-day-before restriction).
     * byAdmin allows admin override.
     */
    @Transactional
    public Appointment rescheduleAppointment(Long appointmentId, Long actingUserId, LocalDateTime newRequestedDateTime, boolean byAdmin) {
    	Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!lockService.isLockedAndActive(appt)) {
            throw new ConflictException("Appointment is not locked. Please acquire lock before rescheduling.");
        }

        if (!appt.getLockedBy().equals(actingUserId)) {
            throw new ConflictException("Appointment currently locked by another user.");
        }
    	
        if (appt.getStatus() != Appointment.AppointmentStatus.CONFIRMED) {
            throw new ConflictException("Only confirmed appointments can be rescheduled");
        }

        if (!byAdmin && appt.getScheduledDateTime() != null && appt.getScheduledDateTime().isBefore(LocalDateTime.now().plusDays(1))) {
            throw new ConflictException("Cannot reschedule less than 1 day before appointment");
        }
        
        if (!newRequestedDateTime.isAfter(LocalDateTime.now())) {
            throw new ConflictException("Requested slot must be in the future");
        }

        
        validateSlotTime(newRequestedDateTime);
        
        if (appt.getDoctor() == null) {
            throw new ConflictException("Cannot reschedule appointment with no assigned doctor");
        }
        
        
        Long doctorUserId = appt.getDoctor().getUser().getUserId();
        
        // Doctor leave check
        if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(doctorUserId, newRequestedDateTime.toLocalDate())) {
            throw new ConflictException("Doctor is on leave that date");
        }

        // If another appointment already exists for that doctor at that datetime -> conflict
        if (appointmentRepository.existsByDoctorUserUserIdAndScheduledDateTime(doctorUserId, newRequestedDateTime)) {
            throw new ConflictException("Requested slot already booked");
        }
        
        // If slot is BLOCKED by doctor (Availability.blocked = true) -> conflict
        boolean isBlocked = availabilityRepository.existsByDoctorUserUserIdAndDateAndStartTimeAndBlockedTrue(
                doctorUserId, newRequestedDateTime.toLocalDate(), newRequestedDateTime.toLocalTime());
        if (isBlocked) {
            throw new ConflictException("Requested slot is blocked/unavailable");
        }
        
        LocalDateTime old = appt.getScheduledDateTime();        

        appt.setScheduledDateTime(newRequestedDateTime);
        
        try {
            String meetLink = zoomService.createZoomMeeting(
                "Consultation with Dr. " + appt.getDoctor().getUser().getFullName(),
                newRequestedDateTime,
                20
            );
            appt.setMeetingLink(meetLink);
        } catch (Exception e) {
            throw new ConflictException("Could not generate Zoom link while rescheduling: " + e.getMessage());
        }
        
        lockService.releaseLock(appt);
        Appointment saved = appointmentRepository.save(appt);
        
        // notify
        emailService.sendAppointmentRescheduledEmail(saved.getPatient().getUser().getEmailId(),
                saved.getPatient().getUser().getFullName(), old, saved.getScheduledDateTime(), saved.getMeetingLink());

        emailService.sendAppointmentRescheduledEmail(saved.getDoctor().getUser().getEmailId(),
                saved.getDoctor().getUser().getFullName(), old, saved.getScheduledDateTime(), saved.getMeetingLink());

        return saved;
    }

    /**
     * Cancel appointment (with 1-day-before restriction unless admin)
     * If canceled, free slot and mark payment status (refund handling external).
     */
    @Transactional
    public Appointment cancelAppointment(Long appointmentId, Long actingUserId, boolean byAdmin, CancelRequest req) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        
        if (appt.isReconsult()) {
            throw new ForbiddenException("Reconsult appointments cannot be cancelled.");
        }

        // Check lock
        if (!lockService.isLockedAndActive(appt)) {
            throw new ConflictException("Appointment is not locked. Please acquire lock before cancel.");
        }

        if (!appt.getLockedBy().equals(actingUserId)) {
            throw new ConflictException("Appointment currently locked by another user.");
        }
        
        if(appt.isReAssigned()) {
        	throw new ForbiddenException("Cannot cancel an appointment that already re-assigned.");
        }

        // Determine roles
        boolean isDoctor = doctorRepository.existsByUserId(actingUserId);
        boolean isAdmin = adminRepository.existsByUserUserId(actingUserId);
        boolean isPatient = !isDoctor && !isAdmin;

        LocalDate apptDate = appt.getScheduledDateTime() != null ? appt.getScheduledDateTime().toLocalDate() : null;
        LocalDate today = LocalDate.now();
        
        // ---------- VALIDATE OWNERSHIP ----------
        if (isPatient && !appt.getPatient().getUser().getUserId().equals(actingUserId)) {
            throw new ForbiddenException("You are not authorized to cancel this appointment.");
        }

        if (isDoctor && !appt.getDoctor().getUser().getUserId().equals(actingUserId)) {
            throw new ForbiddenException("You are not authorized to cancel this appointment.");
        }

        // ------------- PATIENT CANCELLATION -------------
        if (isPatient) {
            appt.setStatus(Appointment.AppointmentStatus.CANCELLED);
            LocalDateTime scheduledAtBeforeCancel = appt.getScheduledDateTime();
            appt.setScheduledDateTime(null);
            appt.setMeetingLink(null);

            // No refund
            paymentRepository.findByAppointment(appt).ifPresent(p -> {
                p.setStatus(Payment.Status.FAILED);
                paymentRepository.save(p);
            });

            Appointment saved = appointmentRepository.save(appt);

            // Notify both doctor & patient
            if (saved.getDoctor() != null) {
            	
                emailService.sendAppointmentCancelledEmail(
                		saved.getDoctor().getUser().getEmailId(),
                		saved.getDoctor().getUser().getFullName(),
                    scheduledAtBeforeCancel,
                    "Appointment cancelled by patient. No refund as per policy."
                );
                appt.setDoctor(null);
            }

            emailService.sendAppointmentCancelledEmailToPatient(
                saved.getPatient().getUser().getEmailId(),
                saved.getPatient().getUser().getFullName(),
                scheduledAtBeforeCancel,
                "You have successfully cancelled your appointment. No refund as per policy."
            );

            return saved;
        }

        // ------------- DOCTOR CANCELLATION -------------
        if (isDoctor) {
            if (apptDate != null && apptDate.isAfter(today.plusDays(1))) {
                appt.setStatus(Appointment.AppointmentStatus.CANCELLED);
                
                LocalDateTime scheduledAtBeforeCancel = appt.getScheduledDateTime();
                appt.setScheduledDateTime(null);
                appt.setMeetingLink(null);
                
                // No refund until admin confirms
                paymentRepository.findByAppointment(appt).ifPresent(p -> {
                    p.setStatus(Payment.Status.PENDING); // waiting for admin to finalize refund
                    paymentRepository.save(p);
                });

                // Log this cancellation for admin reassign view
                CancelledAppointment cancelled = new CancelledAppointment();
                cancelled.setAppointment(appt);
                cancelled.setCancelledByDoctor(appt.getDoctor());
                cancelled.setReason(req.getReason());
                cancelled.setCancelledAt(LocalDateTime.now());
                cancelledAppointmentRepository.save(cancelled);
                
                String doctor = appt.getDoctor().getUser().getFullName(); 
                appt.setDoctor(null);

                Appointment saved = appointmentRepository.save(appt);

                // Notify patient only
                emailService.sendAppointmentCancelledEmailToPatient(
                    saved.getPatient().getUser().getEmailId(),
                    saved.getPatient().getUser().getFullName(),
                    scheduledAtBeforeCancel,
                    "Your doctor Dr. "+ doctor + " has cancelled the appointment. Our team will reassign a new doctor shortly."
                );

                return saved;
            } else {
                throw new ConflictException("Doctor can cancel only before 1 day of scheduled appointment.");
            }
        }

        // ------------- ADMIN CANCELLATION -------------
        if (isAdmin || byAdmin) {
            appt.setStatus(Appointment.AppointmentStatus.CANCELLED);
            
            LocalDateTime scheduledAtBeforeCancel = appt.getScheduledDateTime();
            appt.setScheduledDateTime(null);
            appt.setMeetingLink(null);
                        
            // Refund initiated
            paymentRepository.findByAppointment(appt).ifPresent(p -> {
                p.setStatus(Payment.Status.REFUND_INITIATED);
                paymentRepository.save(p);
            });


            // Notify both doctor & patient
            if (appt.getDoctor() != null) {
            	
                emailService.sendAppointmentCancelledEmail(
                		appt.getDoctor().getUser().getEmailId(),
                		appt.getDoctor().getUser().getFullName(),
                    scheduledAtBeforeCancel,
                    "Appointment cancelled by admin."
                );
                appt.setDoctor(null);
            }
            
            Appointment saved = appointmentRepository.save(appt);

            emailService.sendAppointmentCancelledEmailToPatient(
                saved.getPatient().getUser().getEmailId(),
                saved.getPatient().getUser().getFullName(),
                scheduledAtBeforeCancel,
                "Appointment cancelled by admin. Refund has been initiated."
            );

            return saved;
        }

        throw new ForbiddenException("Unauthorized cancellation request.");
    }


    /**
     * Create a reconsult request (free) — only within 10 days and one per original appointment.
     * Visible to doctor only (UI should filter admin views).
     */
    @Transactional
    public Appointment createReconsult(Long originalAppointmentId, Long patientUserId) {
        Appointment original = appointmentRepository.findById(originalAppointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Original appointment not found"));

        if (original.getStatus() != Appointment.AppointmentStatus.COMPLETED) throw new ConflictException("Only completed appointments eligible");

        if (original.getScheduledDateTime().isBefore(LocalDateTime.now().minusDays(10))) {
            throw new ConflictException("Reconsult window expired");
        }

        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        boolean exists = appointmentRepository.existsByPatientAndOriginalAppointmentAndIsReconsultTrue(patient, original);
        if (exists) throw new ConflictException("Reconsult already exists");

        Appointment re = new Appointment();
        re.setPatient(patient);
        re.setDoctor(original.getDoctor());
        re.setOriginalAppointment(original);
        re.setIsReconsult(true);
        re.setFee(0.0);
        re.setStatus(Appointment.AppointmentStatus.PENDING);
        re.setSpecialization(original.getSpecialization());

        Appointment saved = appointmentRepository.save(re);

        // notify doctor only
        if (saved.getDoctor() != null) {
            emailService.sendReconsultRequestedToDoctor(saved.getDoctor().getUser().getEmailId(),
                    saved.getDoctor().getUser().getFullName(),
                    saved.getPatient().getUser().getFullName(),
                    LocalDateTime.now(), original.getAppointmentId());
        }

        return saved;
    }

    /**
     * Schedule reconsult (doctor confirms)
     */
    @Transactional
    public Appointment scheduleReconsult(Long reconsultId, Long doctorUserId, LocalDateTime requestedDateTime) {
        Appointment appt = appointmentRepository.findById(reconsultId)
                .orElseThrow(() -> new ResourceNotFoundException("Reconsult not found"));

        if (!appt.isReconsult()) throw new ConflictException("Not a reconsult appointment");
        
        if (appt.getDoctor() == null || !appt.getDoctor().getUser().getUserId().equals(doctorUserId)) {
            throw new ForbiddenException("Only original doctor may confirm reconsult");
        }
        
        if (appt.getScheduledDateTime() != null || appt.getMeetingLink() != null) {
            throw new ConflictException("Reconsult was already scheduled.");
        }
        
        if (!requestedDateTime.isAfter(LocalDateTime.now())) {
            throw new ConflictException("Requested slot must be in the future");
        }
        
        validateSlotTime(requestedDateTime);
        
        if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(doctorUserId, requestedDateTime.toLocalDate())) {
            throw new ConflictException("Doctor is on leave that date");
        }
        
        // Conflict: another appointment at that exact datetime for the same doctor
        if (appointmentRepository.existsByDoctorUserUserIdAndScheduledDateTime(doctorUserId, requestedDateTime)) {
            throw new ConflictException("Requested slot already booked");
        }
        
        // Blocked slot check (doctor manually blocked via Availability.blocked = true)
        boolean blocked = availabilityRepository.existsByDoctorUserUserIdAndDateAndStartTimeAndBlockedTrue(
                doctorUserId, requestedDateTime.toLocalDate(), requestedDateTime.toLocalTime());
        if (blocked) throw new ConflictException("Requested slot is blocked/unavailable");
        
        appt.setScheduledDateTime(requestedDateTime);
        appt.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        
        try {
            String meetLink = zoomService.createZoomMeeting(
                "Reconsultation with Dr. " + appt.getDoctor().getUser().getFullName(),
                appt.getScheduledDateTime(),
                20 // Duration in minutes
            );
            appt.setMeetingLink(meetLink);
        } catch (Exception e) {
            throw new ConflictException("Could not generate Zoom link for reconsult: " + e.getMessage());
        }
        
        
        Appointment saved = appointmentRepository.save(appt);

        // notify both
        emailService.sendReconsultConfirmed(saved.getPatient().getUser().getEmailId(),
                saved.getPatient().getUser().getFullName(), saved.getScheduledDateTime(), saved.getMeetingLink());
        emailService.sendReconsultConfirmed(saved.getDoctor().getUser().getEmailId(),
                saved.getDoctor().getUser().getFullName(), saved.getScheduledDateTime(), saved.getMeetingLink());

        return saved;
    }
    
    @Transactional
    public Appointment rescheduleReconsult(Long reconsultId, Long doctorUserId, LocalDateTime newRequestedDateTime) {
        Appointment appt = appointmentRepository.findById(reconsultId)
                .orElseThrow(() -> new ResourceNotFoundException("Reconsult not found"));

        if (!appt.isReconsult()) throw new ConflictException("Not a reconsult appointment");
        
        if (appt.getDoctor() == null || !appt.getDoctor().getUser().getUserId().equals(doctorUserId)) {
            throw new ForbiddenException("Only original doctor may reschedule reconsult");
        }

        if (appt.getStatus() != Appointment.AppointmentStatus.CONFIRMED) {
            throw new ConflictException("Only confirmed reconsult appointments can be rescheduled");
        }

        // The 1 day restriction might or might not apply, depending on your policy.
        if (appt.getScheduledDateTime() != null && appt.getScheduledDateTime().isBefore(LocalDateTime.now().plusDays(1))) {
            throw new ConflictException("Cannot reschedule less than 1 day before reconsult appointment");
        }
        
        if (!newRequestedDateTime.isAfter(LocalDateTime.now())) {
            throw new ConflictException("Requested slot must be in the future");
        }
        
        // Validate new requested time
        validateSlotTime(newRequestedDateTime);

        // Doctor leave check
        if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(doctorUserId, newRequestedDateTime.toLocalDate())) {
            throw new ConflictException("Doctor is on leave that date");
        }

        // Conflict with other appointments (same doctor)
        if (appointmentRepository.existsByDoctorUserUserIdAndScheduledDateTime(doctorUserId, newRequestedDateTime)) {
            throw new ConflictException("Requested slot already booked");
        }
        
        // Blocked slot check
        boolean blocked = availabilityRepository.existsByDoctorUserUserIdAndDateAndStartTimeAndBlockedTrue(
                doctorUserId, newRequestedDateTime.toLocalDate(), newRequestedDateTime.toLocalTime());
        if (blocked) throw new ConflictException("Requested slot is blocked/unavailable");

        LocalDateTime old = appt.getScheduledDateTime();
        appt.setScheduledDateTime(newRequestedDateTime);

        // Generate new meeting link similar to scheduling and rescheduling other appointment types
        try {
        	String meetLink = zoomService.createZoomMeeting(
                    "Reconsultation with Dr. " + appt.getDoctor().getUser().getFullName(),
                    appt.getScheduledDateTime(),
                    20
            );
            appt.setMeetingLink(meetLink);
        } catch (Exception e) {
            throw new ConflictException("Could not generate Zoom link while rescheduling reconsult: " + e.getMessage());
        }

        Appointment saved = appointmentRepository.save(appt);

        // Notify patient and doctor
        emailService.sendAppointmentRescheduledEmail(saved.getPatient().getUser().getEmailId(),
                saved.getPatient().getUser().getFullName(), old, saved.getScheduledDateTime(), saved.getMeetingLink());
        emailService.sendAppointmentRescheduledEmail(saved.getDoctor().getUser().getEmailId(),
                saved.getDoctor().getUser().getFullName(), old, saved.getScheduledDateTime(), saved.getMeetingLink());

        return saved;
    }


    // Simple finders matching repository signatures:
    public List<Appointment> findPendingBySpecialization(Doctor.Specialization specialization) {
        return appointmentRepository.findByStatusAndSpecialization(Appointment.AppointmentStatus.PENDING, specialization);
    }

    public List<Appointment> findByDoctorUserId(Long doctorUserId) {
        return appointmentRepository.findByDoctorUserUserId(doctorUserId);
    }

    public List<Appointment> findByPatientUserId(Long patientUserId) {
        return appointmentRepository.findByPatientUserUserId(patientUserId);
    }
    
    public Appointment findByAppointmentId(Long appointmentId, Long actingUserId) {
    	
    	Appointment appt = appointmentRepository.findById(appointmentId)
    			.orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
    	
    	User user = userRepository.findById(actingUserId)
    			.orElseThrow(() -> new ResourceNotFoundException("User not found."));
    	
    	if(user.getRole() == User.Role.PATIENT && appt.getPatient().getUser().getUserId() != actingUserId)
    		throw new ForbiddenException("Appointment not belongs to you.");
    	
        return appt;
    }
    
    public List<Appointment> findByDoctorReconsults(Long doctorUserId) {
    	Doctor doctor = doctorRepository.findByUserUserId(doctorUserId)
    			.orElseThrow(() -> new ResourceNotFoundException("Doctor not found."));
        return appointmentRepository.findByDoctorUserUserIdAndIsReconsultTrue(doctor.getUserId());
    }
}
