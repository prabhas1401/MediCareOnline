package com.example.hms.dto;

public class NotificationRequest {
    private String message;
    private String type; // email, sms, inapp

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}