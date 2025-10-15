package com.medicare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medicare.entity.Appointment;
import com.medicare.entity.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>{
	Optional<Payment> findByAppointment(Appointment appointment);
    List<Payment> findByAppointmentPatientUserUserId(Long patientId);
    List<Payment> findByStatus(Payment.Status status);
}
