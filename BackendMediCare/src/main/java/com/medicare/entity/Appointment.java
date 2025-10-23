package com.medicare.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "appointments")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    public enum AppointmentStatus {
        PENDING, CONFIRMED, CANCELLED, COMPLETED
    }
    
    public enum Symptom {
        FEVER,
        COUGH,
        HEADACHE,
        CHEST_PAIN,
        NAUSEA,
        SHORTNESS_OF_BREATH,
        FATIGUE,
        OTHER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Doctor.Specialization specialization;

    @ElementCollection(targetClass = Symptom.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "appointment_symptoms", joinColumns = @JoinColumn(name = "appointment_id"))
    @Column(name = "symptom")
    private List<Symptom> symptoms;

    @Column(length = 500)
    private String additionalSymptoms;

    private LocalDateTime preferredDate;
    private LocalDateTime scheduledDateTime;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL)
    @JsonIgnore
    private Prescription prescription;

    private String meetingLink;
    
    @Column(nullable = false)
    private Double fee;
    
    private boolean isReconsult = false;

    @OneToOne
    @JoinColumn(name = "original_appointment_id")
    private Appointment originalAppointment;
    
    private Long lockedBy;
    private LocalDateTime lockExpiry;
    
    private boolean reAssigned = false;
    
	public void setIsReconsult(boolean b) {
		this.isReconsult=b;
	}
    
}
