package com.medicare.service;

import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

/**
 * Concrete EmailService using JavaMailSender (SMTP).
 * - No interface (direct injectable).
 * - Display name set to "MediCare HMS".
 * - Uses simple HTML templates as strings.
 */
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromAddress;

    private static final String SENDER_NAME = "MediCare HMS";
    private static final DateTimeFormatter DATE_TIME_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    // Basic helper to send an HTML email synchronously. Replace with @Async if desired.
    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            // set 'from' with display name
            helper.setFrom(new InternetAddress(fromAddress, SENDER_NAME));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
        } catch (MessagingException ex) {
            // Logging omitted for brevity; replace with logger in production
            System.err.println("Failed to send email to " + to + ": " + ex.getMessage());
        } catch (Exception ex) {
            System.err.println("Unexpected email error to " + to + ": " + ex.getMessage());
        }
    }

    // Verification email for new registrations
    public void sendVerificationEmail(String to, String token) {
        String subject = "Verify your MediCare HMS account";
        String link = "http://localhost:8080/api/auth/verify?token=" + token;
        String html = "<p>Welcome to MediCare HMS.</p>"
                + "<p>Please verify your account: <a href=\"" + link + "\">Verify</a></p>"
                + "<p>If link fails, visit: " + link + "</p>";
        sendHtmlEmail(to, subject, html);
    }

    // Password reset email
    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Reset your MediCare HMS password";
        String link = "http://localhost:5173/reset-password?token=" + token;
        String html = "<p>Reset your password: <a href=\"" + link + "\">Reset</a></p>";
        sendHtmlEmail(to, subject, html);
    }

    // Appointment scheduled (patient + doctor)
    public void sendAppointmentScheduledEmail(String to, String recipientName, String doctorName,
                                              String specialization, java.time.LocalDateTime scheduledAt, String meetingLink) {
        String subject = "Appointment Confirmed — " + DATE_TIME_FMT.format(scheduledAt);
        String html = "<p>Hi " + escape(recipientName) + ",</p>"
                + "<p>Your appointment with Dr. " + escape(doctorName) + " (" + escape(specialization) + ") is confirmed for "
                + DATE_TIME_FMT.format(scheduledAt) + ".</p>"
                + "<p>Meeting link: <a href=\"" + meetingLink + "\">Join</a></p>";
        sendHtmlEmail(to, subject, html);
    }

    public void sendAppointmentRescheduledEmail(String to, String name,
                                                java.time.LocalDateTime oldDate, java.time.LocalDateTime newDate, String meetingLink) {
        String subject = "Appointment Rescheduled — " + DATE_TIME_FMT.format(newDate);
        String html = "<p>Hi " + escape(name) + ",</p>"
                + "<p>Your appointment has been rescheduled from "
                + (oldDate != null ? DATE_TIME_FMT.format(oldDate) : "N/A")
                + " to " + DATE_TIME_FMT.format(newDate) + ".</p>"
                + "<p>Meeting link: <a href=\"" + meetingLink + "\">Join</a></p>";
        sendHtmlEmail(to, subject, html);
    }

    public void sendAppointmentCancelledEmail(String to, String name, java.time.LocalDateTime scheduledAt, String reason) {
        String subject = "Appointment Cancelled";
        String html = "<p>Hi " + escape(name) + ",</p>"
                + "<p>Your appointment scheduled for " + (scheduledAt != null ? DATE_TIME_FMT.format(scheduledAt) : "N/A") + " has been cancelled.</p>"
                + (reason != null ? "<p>Reason: " + escape(reason) + "</p>" : "");
        sendHtmlEmail(to, subject, html);
    }
    
    public void sendAppointmentCancelledEmailToPatient(String to, String name, java.time.LocalDateTime scheduledAt, String reason) {
        String subject = "Appointment Cancelled";
        String html = "<p>Hi " + escape(name) + ",</p>"
                + "<p>Your appointment scheduled for " + (scheduledAt != null ? DATE_TIME_FMT.format(scheduledAt) : "N/A") + " has been cancelled.</p>"
                + (reason != null ? "<p>Reason: " + escape(reason) + "</p>" : "")
                +"A refund will be done in 3 working days.";
        sendHtmlEmail(to, subject, html);
    }

    public void sendPrescriptionAddedEmail(String patientEmail, String patientName, String doctorName, String diagnosis, String downloadLink) {
        String subject = "New Prescription from Dr. " + doctorName;
        String html = "<p>Hi " + escape(patientName) + ",</p>"
                + "<p>Dr. " + escape(doctorName) + " has added a prescription.</p>"
                + "<p>Diagnosis: " + escape(diagnosis) + "</p>"
                + (downloadLink != null ? "<p>Download: <a href=\"" + downloadLink + "\">PDF</a></p>" : "");
        sendHtmlEmail(patientEmail, subject, html);
    }

    // Doctor notified on reconsult request creation
    public void sendReconsultRequestedToDoctor(String doctorEmail, String doctorName, String patientName, java.time.LocalDateTime requestedAt, Long originalAppointmentId) {
        String subject = "Reconsult Request — " + patientName;
        String html = "<p>Hi Dr. " + escape(doctorName) + ",</p>"
                + "<p>Patient " + escape(patientName) + " requested a reconsult on " + DATE_TIME_FMT.format(requestedAt) + ".</p>"
                + "<p>View: /doctor/reconsults/" + originalAppointmentId + "</p>";
        sendHtmlEmail(doctorEmail, subject, html);
    }

    // Reconsult confirmed (patient + doctor)
    public void sendReconsultConfirmed(String to, String name, java.time.LocalDateTime scheduledAt, String meetingLink) {
        String subject = "Reconsult Confirmed — " + DATE_TIME_FMT.format(scheduledAt);
        String html = "<p>Hi " + escape(name) + ",</p>"
                + "<p>Your reconsult is confirmed for " + DATE_TIME_FMT.format(scheduledAt) + ".</p>"
                + "<p>Meeting: <a href=\"" + meetingLink + "\">Join</a></p>";
        sendHtmlEmail(to, subject, html);
    }

    // small escape helper
    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

	public void sendDoctorApprovedEmail(String to, String fullName, String name) {
		String subject = "Account Approval";
		String html = "<p>Hi " + escape(fullName) + ",</p>"
                + "<p>Your account is approved for specialization " + name + ".</p>"
                + "<p>You can now login to Medicare HMS. </p>";
		sendHtmlEmail(to, subject, html);
	}
}
