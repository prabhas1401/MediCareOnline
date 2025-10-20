package com.example.hms.dto;

import java.util.Date;

public class PrescriptionDto {
    private Long patientId;
    private Long doctorId;
    private Date date;
    private String details;

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}