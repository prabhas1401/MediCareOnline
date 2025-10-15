package com.medicare.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medicare.entity.DoctorLeave;

@Repository
public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, Long>{
	List<DoctorLeave> findByDoctorUserUserId(Long doctorId);
    boolean existsByDoctorUserUserIdAndLeaveDate(Long doctorId, LocalDate date);
}
