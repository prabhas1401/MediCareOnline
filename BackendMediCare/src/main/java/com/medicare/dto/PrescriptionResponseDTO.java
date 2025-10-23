package com.medicare.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.medicare.entity.MedicineItem;

import lombok.Data;

@Data
public class PrescriptionResponseDTO {
    private Long prescriptionId;
    private AppointmentSummary appointment;
    private String diagnosis;
    private List<MedicineItem> medicines;
    private String additionalNotes;
    private LocalDateTime issuedAt;
}
