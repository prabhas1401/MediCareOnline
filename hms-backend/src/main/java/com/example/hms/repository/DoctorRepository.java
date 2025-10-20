package com.example.hms.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hms.entity.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}