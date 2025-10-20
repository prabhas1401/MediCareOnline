package com.example.hms.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Send email when an appointment is booked
    public void sendAppointmentEmail(String to, String patientName, String date, String startTime) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Appointment Booked Successfully");
        message.setText("Dear " + patientName + ",\n\n" +
                        "Your appointment has been booked on " + date +
                        " at " + startTime + ".\n\nThank you!");
        mailSender.send(message);
    }

    // Send email when an appointment is confirmed
    public void sendConfirmationEmail(String to, String patientName, String date, String startTime) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Appointment Confirmed");
        message.setText("Dear " + patientName + ",\n\n" +
                        "Your appointment on " + date +
                        " at " + startTime + " has been confirmed.\n\nThank you!");
        mailSender.send(message);
    }

    // Send email when an appointment is cancelled
    public void sendCancellationEmail(String to, String patientName, String date, String startTime) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Appointment Cancelled");
        message.setText("Dear " + patientName + ",\n\n" +
                        "Your appointment on " + date +
                        " at " + startTime + " has been cancelled.\n\nThank you!");
        mailSender.send(message);
    }
}

