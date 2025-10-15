package com.medicare.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medicare.entity.Patient;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long>{
	Optional<Patient> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
