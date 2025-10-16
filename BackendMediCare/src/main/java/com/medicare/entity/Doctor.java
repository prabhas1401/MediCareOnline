package com.medicare.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    public enum Specialization {
        CARDIOLOGIST,
        ORTHOPEDIC,
        DENTIST,
        GYNAECOLOGIST,
        NEUROLOGIST,
        GASTROENTEROLOGIST,
        PEDIATRICS,
        RADIOLOGY,
        GENERAL_PHYSICIAN,
        OTOLARYNGOLOGIST_ENT,
        ENDOCRINOLOGIST,
        ONCOLOGY
    }

    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Specialization is required")
    @Column(nullable = false, length = 50)
    private Specialization specialization;

    @NotBlank(message = "Qualification is required")
    @Column(nullable = false, length = 100)
    private String qualification;

    @PositiveOrZero
    private Integer experienceYears;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<Appointment> appointments;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<Availability> availability;
}