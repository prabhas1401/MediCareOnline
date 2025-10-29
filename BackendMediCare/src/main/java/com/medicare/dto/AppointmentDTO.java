package com.medicare.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AppointmentDTO(
	    Long appointmentId,
	    String status,
	    String specialization,
	    List<String> symptoms,
	    String additionalSymptoms,
	    LocalDateTime preferredDate,
	    LocalDateTime scheduledDateTime,
	    LocalDateTime createdDate,
	    LocalDateTime updatedDate,
	    Double fee,
	    Long prescriptionId,
	    String meetingLink,
	    boolean isReconsult,
	    Long originalAppointmentId,
	    PatientInfo patient,
	    DoctorInfo doctor
//	    boolean isRescheduled  // FIXED: Added type
	) {
	    public record PatientInfo(
	        Long userId,
	        String fullName,
	        String emailId,
	        String phoneNumber,
	        String gender,
	        LocalDate dateOfBirth
	    ) {}

	    public record DoctorInfo(
	        Long userId,
	        String fullName,
	        String phoneNumber,
	        String specialization
	    ) {}
	}