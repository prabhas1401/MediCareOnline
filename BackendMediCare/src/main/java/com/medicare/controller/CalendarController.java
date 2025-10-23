package com.medicare.controller;

import java.time.YearMonth;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.medicare.dto.DaySummaryDto;
import com.medicare.service.CalendarService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    /**
     * Month summary for a doctor.
     * Example: GET /api/calendar/doctor/5/summary?year=2025&month=10
     */
    @GetMapping("/doctor/{doctorUserId}/summary")			//Done
    public ResponseEntity<List<DaySummaryDto>> monthSummary(
            @PathVariable Long doctorUserId,
            @RequestParam int year,
            @RequestParam int month // 1..12
    ) {
        YearMonth ym = YearMonth.of(year, month);
        List<DaySummaryDto> summary = calendarService.getMonthSummary(doctorUserId, ym);
        return ResponseEntity.ok(summary);
    }
}
