
package com.medicare.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long prescriptionId;

    @OneToOne(optional = false)
    @JoinColumn(name = "appointment_id", unique = true)
    private Appointment appointment;

    @ManyToOne  // Added: Links the prescription to the prescribing doctor
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @NotBlank(message = "Diagnosis is required")
    @Column(nullable = false, length = 500)
    private String diagnosis;

    @ElementCollection
    @CollectionTable(name = "prescription_medicines", joinColumns = @JoinColumn(name = "prescription_id"))
    private List<MedicineItem> medicines;  // Renamed to medications in DTO for frontend

    @Column(length = 1000)
    private String additionalNotes;

    private LocalDateTime issuedAt = LocalDateTime.now();

    // Added fields for frontend alignment
    private String status = "ACTIVE";  // ACTIVE or EXPIRED
    private LocalDateTime appointmentDate;  // From appointment
    private String advice;  // Additional advice
}