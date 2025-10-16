package com.medicare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medicare.entity.Doctor;
import com.medicare.entity.User;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long>{
	List<Doctor> findBySpecializationAndUserStatus(Doctor.Specialization specialization, User.Status status);
    Optional<Doctor> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
