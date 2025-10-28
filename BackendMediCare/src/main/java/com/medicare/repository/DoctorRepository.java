

package com.medicare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.medicare.entity.Doctor;
import com.medicare.entity.User;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findBySpecializationAndUserStatus(Doctor.Specialization specialization, User.Status status);
    Optional<Doctor> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    Optional<Doctor> findByUserUserId(Long doctorUserId);

    // Added methods to fix errors in DoctorService (for duplicate checks)
    @Query("SELECT COUNT(d) > 0 FROM Doctor d WHERE d.user.phoneNumber = :phoneNumber")
    boolean existsByUserPhoneNumber(@Param("phoneNumber") String phoneNumber);

    @Query("SELECT COUNT(d) > 0 FROM Doctor d WHERE d.user.emailId = :emailId")
    boolean existsByUserEmailId(@Param("emailId") String emailId);
}
