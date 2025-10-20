package com.example.hms.service;

import org.springframework.stereotype.Service;

import com.example.hms.dto.NotificationRequest;

@Service
public class NotificationService {
    public void sendNotification(NotificationRequest request) {
        if ("email".equals(request.getType())) {
            System.out.println("Email sent: " + request.getMessage());
        } else if ("sms".equals(request.getType())) {
            System.out.println("SMS sent: " + request.getMessage());
        }
    }
}