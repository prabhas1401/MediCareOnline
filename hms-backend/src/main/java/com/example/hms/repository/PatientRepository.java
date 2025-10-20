package com.example.hms.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hms.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {
}