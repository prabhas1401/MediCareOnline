package com.medicare.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medicare.entity.Availability;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long>{
   
    //new
    List<Availability> findByDoctorUserUserIdAndBlockedTrueAndDate(Long doctorId, LocalDate date);
    List<Availability> findByDoctorUserUserIdAndBookedTrueAndDate(Long doctorId, LocalDate date);
    boolean existsByDoctorUserUserIdAndDateAndStartTimeAndBlockedTrue(Long doctorId, LocalDate date, LocalTime startTime);
}
