package com.medicare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medicare.entity.Appointment;
import com.medicare.entity.CancelledAppointment;

@Repository
public interface CancelledAppointmentRepository extends JpaRepository<CancelledAppointment, Long>{
	List<CancelledAppointment> findAllByOrderByCancelledAtDesc();
	Optional<CancelledAppointment> findByAppointment(Appointment appointment);
	List<CancelledAppointment> findAllByReassignedFalseOrderByCancelledAtDesc();
	Optional<CancelledAppointment> findByAppointmentAppointmentId(Long appointmentId);

}
