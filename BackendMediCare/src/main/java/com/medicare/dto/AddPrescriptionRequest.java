package com.medicare.dto;

import java.util.List;

import com.medicare.entity.MedicineItem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddPrescriptionRequest {
    @NotBlank
    public String diagnosis;
    @NotNull
    public List<MedicineItem> medicines;
    public String additionalNotes;
}
