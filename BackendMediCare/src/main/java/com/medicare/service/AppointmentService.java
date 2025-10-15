package com.medicare.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.medicare.dto.CancelRequest;
import com.medicare.dto.CreateAppointmentRequest;
import com.medicare.entity.Appointment;
import com.medicare.entity.Availability;
import com.medicare.entity.Doctor;
import com.medicare.entity.Patient;
import com.medicare.entity.Payment;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.AvailabilityRepository;
import com.medicare.repository.DoctorLeaveRepository;
import com.medicare.repository.DoctorRepository;
import com.medicare.repository.PatientRepository;
import com.medicare.repository.PaymentRepository;

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
    private final GoogleMeetService googleMeetService;
    
    

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
    public Appointment scheduleAppointment(Long appointmentId, Long actingUserId, Long doctorUserId, Long availabilityId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // require lock
        if (!actingUserId.equals(appt.getLockedBy())) throw new ForbiddenException("Lock required to schedule");

        if (appt.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new ConflictException("Only pending appointments can be scheduled");
        }

        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        Availability slot = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (!slot.getDoctor().getUser().getUserId().equals(doctorUserId)) throw new ConflictException("Slot not for selected doctor");
        if (slot.isBooked()) throw new ConflictException("Slot already booked");
        if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(doctorUserId, slot.getDate())) {
            throw new ConflictException("Doctor is on leave that date");
        }

        // book slot, set appointment details
        slot.setBooked(true);
        availabilityRepository.save(slot);

        appt.setDoctor(doctor);
        appt.setScheduledDateTime(LocalDateTime.of(slot.getDate(), slot.getStartTime()));
        appt.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        String meetLink;
		try {
			meetLink = googleMeetService.createGoogleMeetEvent(
				    "Consultation with Dr. " + appt.getDoctor().getUser().getFullName(),
				    "Appointment via MediCare HMS",
				    appt.getScheduledDateTime(),
				    30 // Duration in minutes
				);
			appt.setMeetingLink(meetLink);
		} catch (Exception e) {
		    throw new ConflictException("Could not generate Google Meet link: " + e.getMessage());
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
     * Reschedule appointment (1-day-before restriction).
     * byAdmin allows admin override.
     */
    @Transactional
    public Appointment rescheduleAppointment(Long appointmentId, Long actingUserId, Long newAvailabilityId, boolean byAdmin) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!actingUserId.equals(appt.getLockedBy())) throw new ForbiddenException("Lock required to reschedule");

        if (appt.getStatus() != Appointment.AppointmentStatus.CONFIRMED) {
            throw new ConflictException("Only confirmed appointments can be rescheduled");
        }

        if (!byAdmin && appt.getScheduledDateTime() != null && appt.getScheduledDateTime().isBefore(LocalDateTime.now().plusDays(1))) {
            throw new ConflictException("Cannot reschedule less than 1 day before appointment");
        }

        // free previous slot if found
        if (appt.getScheduledDateTime() != null && appt.getDoctor() != null) {
            LocalDateTime prev = appt.getScheduledDateTime();
            List<Availability> prevSlots = availabilityRepository.findByDoctorUserUserIdAndDate(appt.getDoctor().getUser().getUserId(), prev.toLocalDate());
            for (Availability s : prevSlots) {
                if (s.getStartTime().equals(prev.toLocalTime())) {
                    s.setBooked(false);
                    availabilityRepository.save(s);
                    break;
                }
            }
        }

        Availability slot = availabilityRepository.findById(newAvailabilityId)
                .orElseThrow(() -> new ResourceNotFoundException("New slot not found"));

        if (slot.isBooked()) throw new ConflictException("New slot already booked");
        if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(slot.getDoctor().getUser().getUserId(), slot.getDate())) {
            throw new ConflictException("Doctor is on leave that date");
        }
        slot.setBooked(true);
        availabilityRepository.save(slot);

        LocalDateTime old = appt.getScheduledDateTime();
        appt.setScheduledDateTime(LocalDateTime.of(slot.getDate(), slot.getStartTime()));
        
        // Generate new meeting link
        String meetLink;
        try {
            meetLink = googleMeetService.createGoogleMeetEvent(
                "Consultation with Dr. " + appt.getDoctor().getUser().getFullName(),
                "Appointment via MediCare HMS (Rescheduled)",
                LocalDateTime.of(slot.getDate(), slot.getStartTime()),
                30 // Duration in minutes (or your preferred default)
            );
            appt.setMeetingLink(meetLink);
        } catch (Exception e) {
            throw new ConflictException("Could not generate Google Meet link while rescheduling: " + e.getMessage());
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

        if (lockService.isLockedAndActive(appt) && !appt.getLockedBy().equals(actingUserId)) {
            throw new ConflictException("Another user is currently processing this appointment.");
        }

        if (!byAdmin && appt.getScheduledDateTime() != null && appt.getScheduledDateTime().isBefore(LocalDateTime.now().plusDays(1))) {
            throw new ConflictException("Cannot cancel less than 1 day before appointment");
        }

        appt.setStatus(Appointment.AppointmentStatus.CANCELLED);

        // free slot
        if (appt.getScheduledDateTime() != null && appt.getDoctor() != null) {
            LocalDateTime sched = appt.getScheduledDateTime();
            List<Availability> slots = availabilityRepository.findByDoctorUserUserIdAndDate(appt.getDoctor().getUser().getUserId(), sched.toLocalDate());
            for (Availability s : slots) {
                if (s.getStartTime().equals(sched.toLocalTime())) {
                    s.setBooked(false);
                    availabilityRepository.save(s);
                    break;
                }
            }
        }

        // mark payment as FAILED (placeholder for refund flow)
        paymentRepository.findByAppointment(appt).ifPresent(p -> {
            p.setStatus(Payment.Status.FAILED);
            paymentRepository.save(p);
        });

        if (appt.getLockedBy() != null) lockService.releaseLock(appt);
        Appointment saved = appointmentRepository.save(appt);

        // notify
        emailService.sendAppointmentCancelledEmailToPatient(saved.getPatient().getUser().getEmailId(),
                saved.getPatient().getUser().getFullName(), saved.getScheduledDateTime(), req.getReason());
        if (saved.getDoctor() != null) {
            emailService.sendAppointmentCancelledEmail(saved.getDoctor().getUser().getEmailId(),
                    saved.getDoctor().getUser().getFullName(), saved.getScheduledDateTime(), req.getReason());
        }

        return saved;
    }

    /**
     * Mark appointment completed by assigned doctor
     */
    @Transactional
    public Appointment markCompleted(Long appointmentId, Long doctorUserId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        if (appt.getDoctor() == null || !appt.getDoctor().getUser().getUserId().equals(doctorUserId)) {
            throw new ForbiddenException("Only assigned doctor may mark complete");
        }
        appt.setStatus(Appointment.AppointmentStatus.COMPLETED);
        return appointmentRepository.save(appt);
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
    public Appointment scheduleReconsult(Long reconsultId, Long doctorUserId, Long availabilityId, Long actingUserId) {
        Appointment appt = appointmentRepository.findById(reconsultId)
                .orElseThrow(() -> new ResourceNotFoundException("Reconsult not found"));

        if (!appt.isReconsult()) throw new ConflictException("Not a reconsult");
        if (appt.getDoctor() == null || !appt.getDoctor().getUser().getUserId().equals(doctorUserId)) {
            throw new ForbiddenException("Only original doctor may confirm reconsult");
        }

        // lock logic
        if (lockService.isLockedAndActive(appt) && !appt.getLockedBy().equals(actingUserId)) {
            throw new ConflictException("Another user is currently processing this appointment.");
        }
        if (appt.getLockedBy() == null || lockService.isLockExpired(appt)) {
            lockService.applyLock(appt, actingUserId);
        }

        Availability slot = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));
        if (slot.isBooked()) throw new ConflictException("Slot already booked");
        if (!slot.getDoctor().getUser().getUserId().equals(doctorUserId)) throw new ConflictException("Slot not for this doctor");

        slot.setBooked(true);
        availabilityRepository.save(slot);

        appt.setScheduledDateTime(LocalDateTime.of(slot.getDate(), slot.getStartTime()));
        appt.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        String meetLink;
        try {
            meetLink = googleMeetService.createGoogleMeetEvent(
                "Reconsultation with Dr. " + appt.getDoctor().getUser().getFullName(),
                "Reconsult appointment via MediCare HMS",
                appt.getScheduledDateTime(),
                30 // Duration in minutes
            );
            appt.setMeetingLink(meetLink);
        } catch (Exception e) {
            throw new ConflictException("Could not generate Google Meet link for reconsult: " + e.getMessage());
        }
        lockService.releaseLock(appt);
        Appointment saved = appointmentRepository.save(appt);

        // notify both
        emailService.sendReconsultConfirmed(saved.getPatient().getUser().getEmailId(),
                saved.getPatient().getUser().getFullName(), saved.getScheduledDateTime(), saved.getMeetingLink());
        emailService.sendReconsultConfirmed(saved.getDoctor().getUser().getEmailId(),
                saved.getDoctor().getUser().getFullName(), saved.getScheduledDateTime(), saved.getMeetingLink());

        return saved;
    }
    
    @Transactional
    public Appointment rescheduleReconsult(Long reconsultId, Long doctorUserId, Long newAvailabilityId) {
        Appointment appt = appointmentRepository.findById(reconsultId)
                .orElseThrow(() -> new ResourceNotFoundException("Reconsult not found"));

        if (!appt.isReconsult()) throw new ConflictException("Not a reconsult");
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

        // free previous slot if found
        if (appt.getScheduledDateTime() != null) {
            LocalDateTime prev = appt.getScheduledDateTime();
            List<Availability> prevSlots = availabilityRepository.findByDoctorUserUserIdAndDate(appt.getDoctor().getUser().getUserId(), prev.toLocalDate());
            for (Availability s : prevSlots) {
                if (s.getStartTime().equals(prev.toLocalTime())) {
                    s.setBooked(false);
                    availabilityRepository.save(s);
                    break;
                }
            }
        }

        Availability newSlot = availabilityRepository.findById(newAvailabilityId)
                .orElseThrow(() -> new ResourceNotFoundException("New slot not found"));

        if (newSlot.isBooked()) throw new ConflictException("New slot already booked");
        if (!newSlot.getDoctor().getUser().getUserId().equals(doctorUserId))
            throw new ConflictException("New slot not for this doctor");

        newSlot.setBooked(true);
        availabilityRepository.save(newSlot);

        LocalDateTime old = appt.getScheduledDateTime();
        appt.setScheduledDateTime(LocalDateTime.of(newSlot.getDate(), newSlot.getStartTime()));

        // Generate new meeting link similar to scheduling and rescheduling other appointment types
        String meetLink;
        try {
            meetLink = googleMeetService.createGoogleMeetEvent(
                    "Reconsultation with Dr. " + appt.getDoctor().getUser().getFullName(),
                    "Rescheduled Reconsult via MediCare HMS",
                    appt.getScheduledDateTime(),
                    30
            );
            appt.setMeetingLink(meetLink);
        } catch (Exception e) {
            throw new ConflictException("Could not generate Google Meet link while rescheduling reconsult: " + e.getMessage());
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
}
