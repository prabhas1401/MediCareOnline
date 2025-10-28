package com.medicare.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.medicare.entity.MedicineItem;

import lombok.Data;

@Data
public class PrescriptionResponseDTO {
    private Long prescriptionId;
    private AppointmentSummary appointment;  // Keep or enhance
    private String diagnosis;
    private List<MedicineItem> medicines;
    private String additionalNotes;
    private LocalDateTime issuedAt;
    private String status = "ACTIVE";
    private LocalDateTime appointmentDate;
    private String advice;
    // Add new fields
    private String doctorName;
    private String specialization;
    
}

