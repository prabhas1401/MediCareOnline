package com.medicare.dto;

import java.time.LocalDate;

public record AvailabilityDto(
	    Long availabilityId,
	    LocalDate date,
	    String startTime,  // ISO TIME as string
	    String endTime,
	    boolean booked,
	    boolean blocked,
	    String reason
	) {}
