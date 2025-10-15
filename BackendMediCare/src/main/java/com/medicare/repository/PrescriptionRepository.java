package com.medicare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medicare.entity.Appointment;
import com.medicare.entity.Prescription;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long>{
	Optional<Prescription> findByAppointment(Appointment appointment);
    List<Prescription> findByDoctorUserUserId(Long doctorId);
    List<Prescription> findByPatientUserUserId(Long patientId);
    
    List<Prescription> findByAppointmentDoctorUserUserId(Long doctorId);
    List<Prescription> findByAppointmentPatientUserUserId(Long patientId);

}

