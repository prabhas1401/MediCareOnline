//package com.example.hms.service;
//
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import com.example.hms.entity.Appointment;
//import com.example.hms.repository.AppointmentRepository;
//
//@Service
//public class AppointmentService {
//    @Autowired
//    private AppointmentRepository appointmentRepository;
//
//    public List<Appointment> getAllAppointments() {
//        return appointmentRepository.findAll();
//    }
//
//    public void confirmAppointment(Long id) {
//        Appointment appt = appointmentRepository.findById(id).orElseThrow();
//        appt.setStatus("confirmed");
//        appointmentRepository.save(appt);
//    }
//
//    public void cancelAppointment(Long id) {
//        appointmentRepository.deleteById(id);
//    }
//
//    // Add availability check logic here
//}
//package com.example.hms.service;
//
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import com.example.hms.entity.Appointment;
//import com.example.hms.repository.AppointmentRepository;
//
//@Service
//public class AppointmentService {
//
//    @Autowired
//    private AppointmentRepository appointmentRepository;
//
//    public List<Appointment> getAllAppointments() {
//        return appointmentRepository.findAll();
//    }
//
//    public void confirmAppointment(Long id) {
//        Appointment appt = appointmentRepository.findById(id).orElseThrow();
//        appt.setStatus("confirmed");
//        appointmentRepository.save(appt);
//    }
//
//    public void cancelAppointment(Long id) {
//        Appointment appt = appointmentRepository.findById(id).orElseThrow();
//        appt.setStatus("cancelled");
//        appointmentRepository.save(appt);
//    }
//
//    public Appointment bookAppointment(Appointment appointment) {
//        appointment.setStatus("pending"); // default status
//        return appointmentRepository.save(appointment);
//    }
//}

package com.example.hms.service;

import java.text.SimpleDateFormat;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.hms.entity.Appointment;
import com.example.hms.repository.AppointmentRepository;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private EmailService emailService;

    private final SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");

    // Get all appointments
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // Book a new appointment
    public Appointment bookAppointment(Appointment appointment) {
        appointment.setStatus("pending");
        Appointment saved = appointmentRepository.save(appointment);

        // Send email to patient
        String patientEmail = saved.getPatient().getEmail();
        String patientName = saved.getPatient().getName();
        String date = dateFormat.format(saved.getDate());
        String startTime = saved.getStartTime() != null ? saved.getStartTime() : "N/A";
        emailService.sendAppointmentEmail(patientEmail, patientName, date, startTime);

        return saved;
    }

    // Confirm an appointment
    public void confirmAppointment(Long id) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow();
        appt.setStatus("confirmed");
        appointmentRepository.save(appt);

        // Send confirmation email
        String patientEmail = appt.getPatient().getEmail();
        String patientName = appt.getPatient().getName();
        String date = dateFormat.format(appt.getDate());
        String startTime = appt.getStartTime() != null ? appt.getStartTime() : "N/A";
        emailService.sendConfirmationEmail(patientEmail, patientName, date, startTime);
    }

    // Cancel an appointment
    public void cancelAppointment(Long id) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow();
        appointmentRepository.deleteById(id);

        // Send cancellation email
        String patientEmail = appt.getPatient().getEmail();
        String patientName = appt.getPatient().getName();
        String date = dateFormat.format(appt.getDate());
        String startTime = appt.getStartTime() != null ? appt.getStartTime() : "N/A";
        emailService.sendCancellationEmail(patientEmail, patientName, date, startTime);
    }
}

