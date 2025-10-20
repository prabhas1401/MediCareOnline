package com.example.hms.dto;

import java.util.Date;

public class AppointmentDto {
    private Long doctorId;
    private Date date;
    private String symptoms;

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }
    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }
}