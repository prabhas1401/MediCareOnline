package com.example.hms.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.hms.dto.AvailabilityRequest;
import com.example.hms.entity.Appointment;
import com.example.hms.entity.Doctor;
import com.example.hms.entity.User;
import com.example.hms.repository.AppointmentRepository;
import com.example.hms.repository.UserRepository;

@Service
public class DoctorService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<Doctor> getAllDoctors() {
        return userRepository.findAll().stream().filter(u -> "doctor".equals(u.getRole())).map(u -> (Doctor) u).collect(Collectors.toList());
    }

    public void approveDoctor(Long id) {
        Doctor doctor = (Doctor) userRepository.findById(id).orElseThrow();
        doctor.setApproved(true);
        userRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {
        userRepository.deleteById(id);
    }

    public List<Appointment> getAppointments(Long doctorId) {
        return appointmentRepository.findAll().stream().filter(a -> a.getDoctor().getId().equals(doctorId)).collect(Collectors.toList());
    }

    public void markCompleted(Long id) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow();
        appt.setStatus("completed");
        appointmentRepository.save(appt);
    }

    public void cancelAppointment(Long id) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow();
        appt.setStatus("cancelled");
        appointmentRepository.save(appt);
    }

    public List<User> getPatients(Long doctorId) {
        return appointmentRepository.findAll().stream().filter(a -> a.getDoctor().getId().equals(doctorId)).map(a -> a.getPatient()).distinct().collect(Collectors.toList());
    }

    public void setAvailability(AvailabilityRequest request, Long doctorId) {
        // Simulate
    }
}
