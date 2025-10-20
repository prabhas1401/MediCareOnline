package com.example.hms.dto;

import java.util.Date;

public class AvailabilityRequest {
    private Date date;
    private String status; // available, leave
    private String startTime;
    private String endTime;

    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
}