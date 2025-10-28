
package com.medicare.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;
import com.medicare.entity.Patient;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long>{
    
    List<Appointment> findByStatusAndSpecializationAndIsReconsultFalse(Appointment.AppointmentStatus status, Doctor.Specialization specialization);
    List<Appointment> findByStatus(String status);  // Kept for backward compatibility if needed elsewhere
    List<Appointment> findByDoctorUserUserId(Long userId);
    
    List<Appointment> findByPatientUserUserId(Long userId);
    
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);  // UPDATED: Changed parameter to enum for consistency
    
    boolean existsByPatientAndOriginalAppointmentAndIsReconsultTrue(Patient patient, Appointment appointment);
    
    Optional<Appointment> findByAppointmentIdAndLockedByIsNull(Long id);  // Added: For locking logic
    
    boolean existsByDoctorUserUserIdAndScheduledDateTime(Long doctorUserId, LocalDateTime scheduledDateTime);
    
    List<Appointment> findByDoctorUserUserIdAndScheduledDateTimeBetween(Long doctorUserId, LocalDateTime from, LocalDateTime to);
    
    List<Appointment> findAllByStatusAndScheduledDateTimeBefore(
            Appointment.AppointmentStatus status, LocalDateTime cutoff);
    
    List<Appointment> findByDoctorUserUserIdAndIsReconsultTrue(Long userId);
    
    List<Appointment> findByStatusAndSpecialization(Appointment.AppointmentStatus status, Doctor.Specialization specialization);
    
    boolean existsByDoctorUserUserIdAndScheduledDateTimeBetweenAndStatusIn(Long doctorUserId,
            LocalDateTime startOfDay, LocalDateTime endOfDay, List<Appointment.AppointmentStatus> statusList);
    
    List<Appointment> findByStatusAndIsReconsultFalse(Appointment.AppointmentStatus status);
}
