package com.example.hms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hms.entity.Doctor;
import com.example.hms.service.DoctorService;

@RestController
@RequestMapping("/api/admin/doctors")
@CrossOrigin(origins = "*") // Enables frontend access
public class AdminDoctorController {

    @Autowired
    private DoctorService doctorService;

    // ✅ Get all doctors
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    // ✅ Approve doctor by ID
    @PutMapping("/{id}/approve")
    public ResponseEntity<String> approveDoctor(@PathVariable Long id) {
        doctorService.approveDoctor(id);
        return ResponseEntity.ok("Doctor approved successfully");
    }

    // ✅ Delete doctor by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok("Doctor deleted successfully");
    }
}
