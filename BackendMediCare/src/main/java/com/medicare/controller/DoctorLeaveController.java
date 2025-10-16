package com.medicare.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicare.entity.DoctorLeave;
import com.medicare.service.DoctorLeaveService;

import lombok.RequiredArgsConstructor;

/**
 * DoctorLeaveController
 *
 * - Allows querying leaves for a doctor.
 */
@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class DoctorLeaveController {

    private final DoctorLeaveService doctorLeaveService;

    @GetMapping("/doctor/{doctorUserId}")
    public ResponseEntity<List<DoctorLeave>> getLeaves(@PathVariable Long doctorUserId) {
        return ResponseEntity.ok(doctorLeaveService.getLeavesForDoctor(doctorUserId));
    }
}