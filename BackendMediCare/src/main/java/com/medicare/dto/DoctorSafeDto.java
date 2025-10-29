package com.medicare.dto;

import java.time.LocalDateTime;
import java.util.List;
public record DoctorSafeDto(
	    Long userId,
	    String fullName,
	    String emailId,
	    String phoneNumber,
	    String role,
	    String status,
	    LocalDateTime createdAt,
	    String specialization,
	    String qualification,
	    int experienceYears,
	    List<AppointmentSummaryDto> appointments,
	    List<AvailabilityDto> availability
	) {}



