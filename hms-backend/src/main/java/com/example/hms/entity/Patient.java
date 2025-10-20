package com.example.hms.entity;

import javax.persistence.*;
import java.util.Date;

@Entity
public class Patient extends User {
    private Date dob;
    private String mobile;
    private String gender;

    // Getters and setters
    public Date getDob() { return dob; }
    public void setDob(Date dob) { this.dob = dob; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
}