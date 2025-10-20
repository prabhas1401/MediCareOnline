package com.example.hms.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hms.entity.Prescription;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
}