package com.example.hms.repository;
import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hms.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctorIdAndDate(Long doctorId, Date date);
}

//package com.example.hms.repository;
//
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import com.example.hms.entity.Appointment;
//
//public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
//}
//package com.example.hms.repository;
//
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import com.example.hms.entity.Appointment;
//
//public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
//}

