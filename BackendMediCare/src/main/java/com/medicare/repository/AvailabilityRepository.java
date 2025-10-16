package com.medicare.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medicare.entity.Availability;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long>{
	List<Availability> findByDoctorUserUserIdAndDate(Long doctorId, LocalDate date);
    List<Availability> findByDoctorUserUserIdAndBookedFalse(Long doctorId);
    boolean existsByDoctorUserUserIdAndDateAndStartTimeAndBookedFalse(Long doctorId, LocalDate date, java.time.LocalTime startTime);
}
