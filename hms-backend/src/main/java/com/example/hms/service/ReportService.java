package com.example.hms.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.hms.repository.AppointmentRepository;
import com.example.hms.repository.UserRepository;

@Service
public class ReportService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("patients", userRepository.findAll().stream().filter(u -> "patient".equals(u.getRole())).count());
        stats.put("doctors", userRepository.findAll().stream().filter(u -> "doctor".equals(u.getRole())).count());
        stats.put("appointments", appointmentRepository.count());
        return stats;
    }
}