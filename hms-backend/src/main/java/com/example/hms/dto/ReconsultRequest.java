package com.example.hms.dto;

public class ReconsultRequest {
    private Long doctorId;
    private String reason;

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}