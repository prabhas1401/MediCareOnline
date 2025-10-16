package com.medicare.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicare.entity.Availability;
import com.medicare.service.AvailabilityService;

import lombok.RequiredArgsConstructor;

/**
 * AvailabilityController
 *
 * - Read-only endpoints for patients/admins to view doctor's availability,
 *   and doctors create slots via DoctorController (keeps responsibilities clean).
 */
@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/doctor/{doctorUserId}/date/{date}")
    public ResponseEntity<List<Availability>> getByDoctorAndDate(@PathVariable Long doctorUserId,
                                                                 @PathVariable String date) {
        LocalDate d = LocalDate.parse(date);
        return ResponseEntity.ok(availabilityService.getSlotsForDoctorOnDate(doctorUserId, d));
    }

    @GetMapping("/doctor/{doctorUserId}/free")
    public ResponseEntity<List<Availability>> getFreeSlots(@PathVariable Long doctorUserId) {
        return ResponseEntity.ok(availabilityService.getAvailableSlotsForDoctor(doctorUserId));
    }
}
