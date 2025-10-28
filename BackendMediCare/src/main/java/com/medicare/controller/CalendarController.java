package com.medicare.controller;

import java.time.YearMonth;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.medicare.dto.DaySummaryDto;
import com.medicare.repository.DoctorRepository;
import com.medicare.service.CalendarService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;
    private final DoctorRepository doctorRepository;

    /**
     * Month summary for a doctor.
     * Example: GET /api/calendar/doctor/6/summary?year=2025&month=10
     * Verifies the doctor exists and matches the authenticated user.
     */
    @GetMapping("/doctor/{doctorId}/summary")
    public ResponseEntity<List<DaySummaryDto>> monthSummary(
            @PathVariable Long doctorId,
            @RequestParam int year,
            @RequestParam int month,
            Authentication authentication
    ) {
        // Verify the authenticated user is a doctor and matches the doctorId
        Long userId = (Long) authentication.getPrincipal();
        doctorRepository.findById(doctorId)
                .filter(doctor -> doctor.getUser().getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Doctor not found or access denied"));

        YearMonth ym = YearMonth.of(year, month);
        List<DaySummaryDto> summary = calendarService.getMonthSummary(userId, ym);
        return ResponseEntity.ok(summary);
    }
}
