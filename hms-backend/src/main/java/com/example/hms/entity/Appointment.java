//package com.example.hms.entity;
//
//import javax.persistence.*;
//import java.util.Date;
//
//@Entity
//public class Appointment {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//    @ManyToOne
//    private Patient patient;
//    @ManyToOne
//    private Doctor doctor;
//    private Date date;
//    private String symptoms;
//    private String status; // pending, confirmed, completed, cancelled
//
//    // Getters and setters
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//    public Patient getPatient() { return patient; }
//    public void setPatient(Patient patient) { this.patient = patient; }
//    public Doctor getDoctor() { return doctor; }
//    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
//    public Date getDate() { return date; }
//    public void setDate(Date date) { this.date = date; }
//    public String getSymptoms() { return symptoms; }
//    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }
//    public String getStatus() { return status; }
//    public void setStatus(String status) { this.status = status; }
//}
package com.example.hms.entity;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

@Entity
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Patient patient;

    @ManyToOne
    private Doctor doctor;

    private Date date;
    private String symptoms;
    private String status; // pending, confirmed, completed, cancelled

    private String startTime; // optional, for detailed scheduling
    private String endTime;   // optional

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
}
