package com.medicare.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
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
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
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

    public boolean isLockedAndActive(Appointment appt) {
        return lockService.isLockedAndActive(appt);
    }

    @Transactional
    public Appointment createAppointmentRequest(Long patientUserId, CreateAppointmentRequest req) {
        log.debug("Creating appointment request for patientUserId: {}", patientUserId);
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

    @Transactional
    public Appointment scheduleAppointment(Long appointmentId, Long actingUserId, Long doctorUserId, LocalDateTime requestedDateTime) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        if (appt.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new IllegalStateException("Appointment is not in PENDING status and cannot be scheduled");
        }

        if (appt.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new ConflictException("Cannot schedule a cancelled appointment.");
        }

        if (!lockService.isLockedAndActive(appt)) {
            throw new ConflictException("Appointment is not locked. Please acquire lock before scheduling.");
        }

        if (!appt.getLockedBy().equals(actingUserId)) {
            throw new ConflictException("Appointment currently locked by another user.");
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

        lockService.releaseLock(appt);
        Appointment saved = appointmentRepository.save(appt);

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

    public void validateSlotTime(LocalDateTime dt) {
        LocalTime t = dt.toLocalTime();
        LocalTime start = LocalTime.of(9, 0);
        LocalTime end = LocalTime.of(17, 0);
        if (dt.getMinute() % 20 != 0) throw new ConflictException("Slot must align to 20-minute boundary (e.g., 09:00, 09:20)");
        if (t.isBefore(start) || t.isAfter(end.minusMinutes(20))) throw new ConflictException("Slot outside working hours");
        if (!t.isBefore(LocalTime.of(12, 0)) && t.isBefore(LocalTime.of(13, 0))) throw new ConflictException("Slot during lunch break");
    }

    @Transactional
    public Appointment rescheduleAppointment(Long appointmentId, Long actingUserId, LocalDateTime newRequestedDateTime, boolean byAdmin) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appt.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new ConflictException("Cannot reschedule a cancelled appointment.");
        }

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

        if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(doctorUserId, newRequestedDateTime.toLocalDate())) {
            throw new ConflictException("Doctor is on leave that date");
        }

        if (appointmentRepository.existsByDoctorUserUserIdAndScheduledDateTime(doctorUserId, newRequestedDateTime)) {
            throw new ConflictException("Requested slot already booked");
        }

        boolean isBlocked = availabilityRepository.existsByDoctorUserUserIdAndDateAndStartTimeAndBlockedTrue(
                doctorUserId, newRequestedDateTime.toLocalDate(), newRequestedDateTime.toLocalTime());
        if (isBlocked) throw new ConflictException("Requested slot is blocked/unavailable");

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

        emailService.sendAppointmentRescheduledEmail(saved.getPatient().getUser().getEmailId(),
                saved.getPatient().getUser().getFullName(), old, saved.getScheduledDateTime(), saved.getMeetingLink());
        emailService.sendAppointmentRescheduledEmail(saved.getDoctor().getUser().getEmailId(),
                saved.getDoctor().getUser().getFullName(), old, saved.getScheduledDateTime(), saved.getMeetingLink());

        return saved;
    }

    @Transactional
    public Appointment cancelAppointment(Long appointmentId, Long actingUserId, boolean byAdmin, CancelRequest req) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appt.isReconsult()) {
            throw new ForbiddenException("Reconsult appointments cannot be cancelled.");
        }

        boolean isDoctor = doctorRepository.existsByUserId(actingUserId);
        boolean isAdmin = adminRepository.existsByUserUserId(actingUserId);
        boolean isPatient = !isDoctor && !isAdmin;

        LocalDate apptDate = appt.getScheduledDateTime() != null ? appt.getScheduledDateTime().toLocalDate() : null;
        LocalDate today = LocalDate.now();

        if (isPatient && !appt.getPatient().getUser().getUserId().equals(actingUserId)) {
            throw new ForbiddenException("You are not authorized to cancel this appointment.");
        }

        if (isDoctor && !appt.getDoctor().getUser().getUserId().equals(actingUserId)) {
            throw new ForbiddenException("You are not authorized to cancel this appointment.");
        }

        if (!byAdmin && appt.getDoctor() == null) {
            throw new ConflictException("Appointment has no assigned doctor.");
        }
        if (appt.getPatient() == null) {
            throw new ConflictException("Appointment has no assigned patient.");
        }

        if (isPatient) {
            appt.setStatus(Appointment.AppointmentStatus.CANCELLED);
            LocalDateTime scheduledAtBeforeCancel = appt.getScheduledDateTime();
            appt.setScheduledDateTime(null);
            appt.setMeetingLink(null);

            paymentRepository.findByAppointment(appt).ifPresent(p -> {
                p.setStatus(Payment.Status.FAILED);
                paymentRepository.save(p);
            });

            Appointment saved = appointmentRepository.save(appt);

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

        if (isDoctor) {
            if (!lockService.isLockedAndActive(appt)) {
                throw new ConflictException("Appointment is not locked. Please acquire lock before cancel.");
            }

            if (!appt.getLockedBy().equals(actingUserId)) {
                throw new ConflictException("Appointment currently locked by another user.");
            }

            if(appt.isReAssigned()) {
                throw new ForbiddenException("Cannot cancel an appointment that already re-assigned.");
            }

            if (apptDate != null && apptDate.isAfter(today)) {
                appt.setStatus(Appointment.AppointmentStatus.CANCELLED);

                LocalDateTime scheduledAtBeforeCancel = appt.getScheduledDateTime();
                appt.setScheduledDateTime(null);
                appt.setMeetingLink(null);

                paymentRepository.findByAppointment(appt).ifPresent(p -> {
                    p.setStatus(Payment.Status.PENDING);
                    paymentRepository.save(p);
                });

                CancelledAppointment cancelled = new CancelledAppointment();
                cancelled.setAppointment(appt);
                cancelled.setCancelledByDoctor(appt.getDoctor());
                cancelled.setReason(req.getReason());
                cancelled.setCancelledAt(LocalDateTime.now());
                cancelled.setPreviousScheduledDateTime(scheduledAtBeforeCancel);
                cancelledAppointmentRepository.save(cancelled);

                String doctor = appt.getDoctor().getUser().getFullName();
                appt.setDoctor(null);

                Appointment saved = appointmentRepository.save(appt);
                lockService.releaseLock(appt);

                emailService.sendAppointmentCancelledEmailToPatient(
                    saved.getPatient().getUser().getEmailId(),
                    saved.getPatient().getUser().getFullName(),
                    scheduledAtBeforeCancel,
                    "Your doctor Dr. "+ doctor + " has cancelled the appointment. Our team will reassign a new doctor shortly."
                );

                return saved;
            } else {
                throw new ConflictException("Doctor cannot cancel on the same day of the scheduled appointment.");
            }
        }

        if (isAdmin || byAdmin) {
            if (!lockService.isLockedAndActive(appt)) {
                throw new ConflictException("Appointment is not locked. Please acquire lock before cancel.");
            }

            if (!appt.getLockedBy().equals(actingUserId)) {
                throw new ConflictException("Appointment currently locked by another user.");
            }

            if(appt.isReAssigned()) {
                throw new ForbiddenException("Cannot cancel an appointment that already re-assigned.");
            }

            appt.setStatus(Appointment.AppointmentStatus.CANCELLED);

            LocalDateTime scheduledAtBeforeCancel = appt.getScheduledDateTime();
            appt.setScheduledDateTime(null);
            appt.setMeetingLink(null);

            paymentRepository.findByAppointment(appt).ifPresent(p -> {
                p.setStatus(Payment.Status.REFUND_INITIATED);
                paymentRepository.save(p);
            });

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
            lockService.releaseLock(appt);

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
    @Transactional
    public Appointment startVisit(Long appointmentId, Long doctorUserId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        
        if (!appt.getDoctor().getUser().getUserId().equals(doctorUserId)) {
            throw new ForbiddenException("Only the assigned doctor can start the visit");
        }
        
        if (appt.getStatus() != Appointment.AppointmentStatus.CONFIRMED) {
            throw new ConflictException("Appointment must be confirmed to start visit");
        }
        
        appt.setStatus(Appointment.AppointmentStatus.IN_PROGRESS);
        return appointmentRepository.save(appt);
    }
    


        @Transactional
        public void cancelAppointmentForPatient(Long appointmentId, Long patientUserId) {
            Appointment appt = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

            if (!appt.getPatient().getUser().getUserId().equals(patientUserId)) {
                throw new ForbiddenException("You are not authorized to cancel this appointment.");
            }

            if (appt.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
                throw new ConflictException("Appointment is already cancelled.");
            }

            appt.setStatus(Appointment.AppointmentStatus.CANCELLED);
            appt.setScheduledDateTime(null);
            appt.setMeetingLink(null);

            paymentRepository.findByAppointment(appt).ifPresent(p -> {
                p.setStatus(Payment.Status.FAILED);
                paymentRepository.save(p);
            });

            appointmentRepository.save(appt);

            emailService.sendAppointmentCancelledEmailToPatient(
                appt.getPatient().getUser().getEmailId(),
                appt.getPatient().getUser().getFullName(),
                appt.getScheduledDateTime(),
                "You have cancelled your appointment. No refund as per policy."
            );

            if (appt.getDoctor() != null) {
                emailService.sendAppointmentCancelledEmail(
                    appt.getDoctor().getUser().getEmailId(),
                    appt.getDoctor().getUser().getFullName(),
                    appt.getScheduledDateTime(),
                    "Appointment cancelled by patient."
                );
            }
        }

        @Transactional
        public void rescheduleAppointmentForPatient(Long appointmentId, Long patientUserId, LocalDateTime newDateTime) {
            Appointment appt = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

            if (!appt.getPatient().getUser().getUserId().equals(patientUserId)) {
                throw new ForbiddenException("You are not authorized to reschedule this appointment.");
            }

            if (appt.getStatus() != Appointment.AppointmentStatus.CONFIRMED) {
                throw new ConflictException("Only confirmed appointments can be rescheduled.");
            }

            if (appt.getScheduledDateTime().isBefore(LocalDateTime.now().plusDays(1))) {
                throw new ConflictException("Cannot reschedule less than 1 day before appointment.");
            }

            if (!newDateTime.isAfter(LocalDateTime.now())) {
                throw new ConflictException("Requested slot must be in the future.");
            }

            validateSlotTime(newDateTime);

            Long doctorUserId = appt.getDoctor().getUser().getUserId();

            if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(doctorUserId, newDateTime.toLocalDate())) {
                throw new ConflictException("Doctor is on leave that date.");
            }

            if (appointmentRepository.existsByDoctorUserUserIdAndScheduledDateTime(doctorUserId, newDateTime)) {
                throw new ConflictException("Requested slot already booked.");
            }

            boolean blocked = availabilityRepository.existsByDoctorUserUserIdAndDateAndStartTimeAndBlockedTrue(
                    doctorUserId, newDateTime.toLocalDate(), newDateTime.toLocalTime());
            if (blocked) throw new ConflictException("Requested slot is blocked/unavailable.");

            LocalDateTime old = appt.getScheduledDateTime();
            appt.setScheduledDateTime(newDateTime);

            try {
                String meetLink = zoomService.createZoomMeeting(
                    "Consultation with Dr. " + appt.getDoctor().getUser().getFullName(),
                    newDateTime,
                    20
                );
                appt.setMeetingLink(meetLink);
            } catch (Exception e) {
                throw new ConflictException("Could not generate Zoom link while rescheduling: " + e.getMessage());
            }

            appointmentRepository.save(appt);

            emailService.sendAppointmentRescheduledEmail(appt.getPatient().getUser().getEmailId(),
                    appt.getPatient().getUser().getFullName(), old, appt.getScheduledDateTime(), appt.getMeetingLink());
            emailService.sendAppointmentRescheduledEmail(appt.getDoctor().getUser().getEmailId(),
                    appt.getDoctor().getUser().getFullName(), old, appt.getScheduledDateTime(), appt.getMeetingLink());
        }

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

            if (saved.getDoctor() != null) {
                emailService.sendReconsultRequestedToDoctor(saved.getDoctor().getUser().getEmailId(),
                        saved.getDoctor().getUser().getFullName(),
                        saved.getPatient().getUser().getFullName(),
                        LocalDateTime.now(), original.getAppointmentId());
            }

            return saved;
        }

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

            if (appointmentRepository.existsByDoctorUserUserIdAndScheduledDateTime(doctorUserId, requestedDateTime)) {
                throw new ConflictException("Requested slot already booked");
            }

            boolean blocked = availabilityRepository.existsByDoctorUserUserIdAndDateAndStartTimeAndBlockedTrue(
                    doctorUserId, requestedDateTime.toLocalDate(), requestedDateTime.toLocalTime());
            if (blocked) throw new ConflictException("Requested slot is blocked/unavailable");

            appt.setScheduledDateTime(requestedDateTime);
            appt.setStatus(Appointment.AppointmentStatus.CONFIRMED);

            try {
                String meetLink = zoomService.createZoomMeeting(
                    "Reconsultation with Dr. " + appt.getDoctor().getUser().getFullName(),
                    appt.getScheduledDateTime(),
                    20
                );
                appt.setMeetingLink(meetLink);
            } catch (Exception e) {
                throw new ConflictException("Could not generate Zoom link for reconsult: " + e.getMessage());
            }

            Appointment saved = appointmentRepository.save(appt);

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

            if (appt.getScheduledDateTime() != null && appt.getScheduledDateTime().isBefore(LocalDateTime.now().plusDays(1))) {
                throw new ConflictException("Cannot reschedule less than 1 day before reconsult appointment");
            }

            if (!newRequestedDateTime.isAfter(LocalDateTime.now())) {
                throw new ConflictException("Requested slot must be in the future");
            }

            validateSlotTime(newRequestedDateTime);

            if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(doctorUserId, newRequestedDateTime.toLocalDate())) {
                throw new ConflictException("Doctor is on leave that date");
            }

            if (appointmentRepository.existsByDoctorUserUserIdAndScheduledDateTime(doctorUserId, newRequestedDateTime)) {
                throw new ConflictException("Requested slot already booked");
            }

            boolean blocked = availabilityRepository.existsByDoctorUserUserIdAndDateAndStartTimeAndBlockedTrue(
                    doctorUserId, newRequestedDateTime.toLocalDate(), newRequestedDateTime.toLocalTime());
            if (blocked) throw new ConflictException("Requested slot is blocked/unavailable");

            LocalDateTime old = appt.getScheduledDateTime();
            appt.setScheduledDateTime(newRequestedDateTime);

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

            emailService.sendAppointmentRescheduledEmail(saved.getPatient().getUser().getEmailId(),
                    saved.getPatient().getUser().getFullName(), old, saved.getScheduledDateTime(), saved.getMeetingLink());
            emailService.sendAppointmentRescheduledEmail(saved.getDoctor().getUser().getEmailId(),
                    saved.getDoctor().getUser().getFullName(), old, saved.getScheduledDateTime(), saved.getMeetingLink());

            return saved;
        }

        public List<Appointment> findPendingBySpecialization(Doctor.Specialization specialization) {
            return appointmentRepository.findByStatusAndSpecialization(Appointment.AppointmentStatus.PENDING, specialization);
        }

        public List<Appointment> getCancelledAppointments() {
            try {
                List<Appointment> appointments = appointmentRepository.findByStatus(Appointment.AppointmentStatus.CANCELLED);
                return appointments;
            } catch (Exception e) {
                log.error("Error fetching cancelled appointments: {}", e.getMessage(), e);
                return new ArrayList<>();
            }
        }

        public List<Appointment> findByDoctorUserId(Long doctorUserId) {
            try {
                if (!doctorRepository.existsByUserId(doctorUserId)) {
                    log.warn("Doctor with ID {} not found, returning empty list", doctorUserId);
                    return new ArrayList<>();
                }
                return appointmentRepository.findByDoctorUserUserId(doctorUserId);
            } catch (Exception e) {
                log.error("Error fetching appointments for doctor ID {}: {}", doctorUserId, e.getMessage(), e);
                return new ArrayList<>();
            }
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

        // New method for admin reschedule (handles LocalDateTime directly)
        @Transactional
        public void rescheduleAppointment(Long appointmentId, LocalDateTime newRequestedDateTime, String reason, Long actingAdminUserId) {
            // Call existing reschedule method with byAdmin=true
            rescheduleAppointment(appointmentId, actingAdminUserId, newRequestedDateTime, true);
            // Optionally log or store reason if needed (not implemented in existing logic)
            log.info("Appointment {} rescheduled by admin {} with reason: {}", appointmentId, actingAdminUserId, reason);
        }

        // New method for admin reassign (handles LocalDateTime directly)
        @Transactional
        public void reassignAppointment(Long appointmentId, Long newDoctorUserId, LocalDateTime requestedDateTime, String reason, Long actingAdminUserId) {
            Appointment appt = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

            if (appt.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
                throw new ConflictException("Cannot reassign a cancelled appointment.");
            }

            // Acquire lock if not already
            if (!lockService.isLockedAndActive(appt)) {
                appt = acquireLock(appointmentId, actingAdminUserId);
            }

            if (!appt.getLockedBy().equals(actingAdminUserId)) {
                throw new ConflictException("Appointment currently locked by another user.");
            }

            Doctor newDoctor = doctorRepository.findByUserId(newDoctorUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("New doctor not found"));

            if (!requestedDateTime.isAfter(LocalDateTime.now())) {
                throw new ConflictException("Requested slot must be in the future");
            }

            validateSlotTime(requestedDateTime);

            if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(newDoctorUserId, requestedDateTime.toLocalDate())) {
                throw new ConflictException("New doctor is on leave that date");
            }

            if (appointmentRepository.existsByDoctorUserUserIdAndScheduledDateTime(newDoctorUserId, requestedDateTime)) {
                throw new ConflictException("Slot already booked for new doctor");
            }

            boolean blocked = availabilityRepository.existsByDoctorUserUserIdAndDateAndStartTimeAndBlockedTrue(
                    newDoctorUserId, requestedDateTime.toLocalDate(), requestedDateTime.toLocalTime());
            if (blocked) throw new ConflictException("Slot marked unavailable by new doctor");

            appt.setDoctor(newDoctor);
            appt.setScheduledDateTime(requestedDateTime);
            appt.setStatus(Appointment.AppointmentStatus.CONFIRMED);
            appt.setReAssigned(true);  // Assuming this field exists

            try {
                String meetingLink = zoomService.createZoomMeeting(
                    "Consultation with Dr. " + newDoctor.getUser().getFullName(),
                    requestedDateTime,
                    20
                );
                appt.setMeetingLink(meetingLink);
            } catch (Exception e) {
                throw new ConflictException("Could not generate Zoom link: " + e.getMessage());
            }

            lockService.releaseLock(appt);
            appointmentRepository.save(appt);

            // Send emails (adapt as needed)
            emailService.sendAppointmentScheduledEmail(appt.getPatient().getUser().getEmailId(),
                    appt.getPatient().getUser().getFullName(),
                    newDoctor.getUser().getFullName(),
                    appt.getSpecialization().name(),
                    appt.getScheduledDateTime(),
                    appt.getMeetingLink());

            emailService.sendAppointmentScheduledEmail(newDoctor.getUser().getEmailId(),
                    newDoctor.getUser().getFullName(),
                    newDoctor.getUser().getFullName(),
                    appt.getSpecialization().name(),
                    appt.getScheduledDateTime(),
                    appt.getMeetingLink());

            log.info("Appointment {} reassigned to doctor {} by admin {} with reason: {}", appointmentId, newDoctorUserId, actingAdminUserId, reason);
        }
    }
