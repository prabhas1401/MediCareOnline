package com.medicare.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.medicare.entity.MedicineItem;
import com.medicare.entity.Patient.Gender;

import lombok.Data;

@Data
public class PrescriptionDetailDto {

    private Long prescriptionId;

    private String patientFullName;
    private Gender patientGender;
    private LocalDateTime patientDateOfBirth;

    private String doctorFullName;
    private String doctorSpecialization;

    private LocalDateTime appointmentDateTime;

    private String diagnosis;
    private List<MedicineItem> medicines;
    private String additionalNotes;
    private LocalDateTime issuedAt;

    private String pdfDownloadUrl;
}
