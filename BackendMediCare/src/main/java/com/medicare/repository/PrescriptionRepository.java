package com.medicare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.medicare.entity.Appointment;
import com.medicare.entity.Prescription;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long>{
	Optional<Prescription> findByAppointment(Appointment appointment);
    
    List<Prescription> findByAppointmentDoctorUserUserId(Long doctorId);
    List<Prescription> findByAppointmentPatientUserUserId(Long patientId);
    @Query("SELECT p FROM Prescription p JOIN FETCH p.appointment a JOIN FETCH a.doctor d WHERE a.patient.userId = :patientId")
    List<Prescription> findByAppointmentPatientUserIdWithDetails(@Param("patientId") Long patientId);

}

