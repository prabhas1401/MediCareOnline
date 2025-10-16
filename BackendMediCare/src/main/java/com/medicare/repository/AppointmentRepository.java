package com.medicare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;
import com.medicare.entity.Patient;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long>{
	List<Appointment> findByStatusAndSpecialization(Appointment.AppointmentStatus status, Doctor.Specialization specialization);
    List<Appointment> findByDoctorUserUserId(Long userId);
    List<Appointment> findByPatientUserUserId(Long userId);
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);
    boolean existsByPatientAndOriginalAppointmentAndIsReconsultTrue(Patient patient, Appointment appointment);
    Optional<Appointment> findByAppointmentIdAndLockedByIsNull(Long id);
}	
