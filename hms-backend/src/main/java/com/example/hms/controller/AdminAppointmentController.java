//package com.example.hms.controller;
//
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.example.hms.entity.Appointment;
//import com.example.hms.service.AppointmentService;
//
//@RestController
//@RequestMapping("/api/admin/appointments")
//public class AdminAppointmentController {
//
//    @Autowired
//    private AppointmentService appointmentService;
//
//    @GetMapping
//    public ResponseEntity<List<Appointment>> getAllAppointments() {
//        return ResponseEntity.ok(appointmentService.getAllAppointments());
//    }
//
//    @PutMapping("/{id}/confirm")
//    public ResponseEntity<?> confirmAppointment(@PathVariable Long id) {
//        appointmentService.confirmAppointment(id);
//        return ResponseEntity.ok("Appointment confirmed");
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
//        appointmentService.cancelAppointment(id);
//        return ResponseEntity.ok("Appointment cancelled");
//    }
//}	
//package com.example.hms.controller;
//
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.example.hms.entity.Appointment;
//import com.example.hms.service.AppointmentService;
//
//@RestController
//@RequestMapping("/api/admin/appointments")
//public class AdminAppointmentController {
//
//    @Autowired
//    private AppointmentService appointmentService;
//
//    @GetMapping
//    public ResponseEntity<List<Appointment>> getAllAppointments() {
//        return ResponseEntity.ok(appointmentService.getAllAppointments());
//    }
//
//    @PutMapping("/{id}/confirm")
//    public ResponseEntity<?> confirmAppointment(@PathVariable Long id) {
//        appointmentService.confirmAppointment(id);
//        return ResponseEntity.ok("Appointment confirmed");
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
//        appointmentService.cancelAppointment(id);
//        return ResponseEntity.ok("Appointment cancelled");
//    }
//
//    // ✅ New: Admin books appointment
//    @PostMapping("/book")
//    public ResponseEntity<Appointment> bookAppointment(@RequestBody Appointment appointment) {
//        Appointment saved = appointmentService.bookAppointment(appointment);
//        return ResponseEntity.ok(saved);
//    }
//}
//package com.example.hms.controller;
//
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.example.hms.entity.Appointment;
//import com.example.hms.service.AppointmentService;
//
//@RestController
//@RequestMapping("/api/admin/appointments")
//@CrossOrigin(origins = "*")
//public class AdminAppointmentController {
//
//    @Autowired
//    private AppointmentService appointmentService;
//
//    @GetMapping
//    public ResponseEntity<List<Appointment>> getAllAppointments() {
//        return ResponseEntity.ok(appointmentService.getAllAppointments());
//    }
//
//    @PutMapping("/{id}/confirm")
//    public ResponseEntity<?> confirmAppointment(@PathVariable Long id) {
//        appointmentService.confirmAppointment(id);
//        return ResponseEntity.ok("Appointment confirmed");
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
//        appointmentService.cancelAppointment(id);
//        return ResponseEntity.ok("Appointment cancelled");
//    }
//
//    @PostMapping("/book")
//    public ResponseEntity<Appointment> bookAppointment(@RequestBody Appointment appointment) {
//        Appointment saved = appointmentService.bookAppointment(appointment);
//        return ResponseEntity.ok(saved);
//    }
//}
//
//package com.example.hms.controller;
//
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.example.hms.entity.Appointment;
//import com.example.hms.service.AppointmentService;
//
//@RestController
//@RequestMapping("/api/admin/appointments")
//@CrossOrigin(origins = "*")
//public class AdminAppointmentController {
//
//    @Autowired
//    private AppointmentService appointmentService;
//
//    // Get all appointments
//    @GetMapping
//    public ResponseEntity<List<Appointment>> getAllAppointments() {
//        return ResponseEntity.ok(appointmentService.getAllAppointments());
//    }
//
//    // Confirm an appointment (email sent automatically in service)
//    @PutMapping("/{id}/confirm")
//    public ResponseEntity<?> confirmAppointment(@PathVariable Long id) {
//        appointmentService.confirmAppointment(id);
//        return ResponseEntity.ok("Appointment confirmed and patient notified via email");
//    }
//
//    // Cancel an appointment (email sent automatically in service)
//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
//        appointmentService.cancelAppointment(id);
//        return ResponseEntity.ok("Appointment cancelled and patient notified via email");
//    }
//
//    // Book a new appointment (email sent automatically in service)
//    @PostMapping("/book")
//    public ResponseEntity<Appointment> bookAppointment(@RequestBody Appointment appointment) {
//        Appointment saved = appointmentService.bookAppointment(appointment);
//        return ResponseEntity.ok(saved);
//    }
//}
package com.example.hms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hms.entity.Appointment;
import com.example.hms.service.AppointmentService;
import com.example.hms.service.EmailService;

@RestController
@RequestMapping("/api/admin/appointments")
@CrossOrigin(origins = "*")
public class AdminAppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private EmailService emailService;

    // Get all appointments
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    // Confirm an appointment (email sent automatically in service)
    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable Long id) {
        appointmentService.confirmAppointment(id);
        return ResponseEntity.ok("Appointment confirmed and patient notified via email");
    }

    // Cancel an appointment (email sent automatically in service)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok("Appointment cancelled and patient notified via email");
    }

    // Book a new appointment (email sent automatically in service)
    @PostMapping("/book")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody Appointment appointment) {
        Appointment saved = appointmentService.bookAppointment(appointment);

        // Send email to patient
        String patientEmail = saved.getPatient().getEmail();
        String patientName = saved.getPatient().getName();
        String dateTime = saved.getDate().toString();
        emailService.sendAppointmentEmail(patientEmail, patientName, dateTime);

        return ResponseEntity.ok(saved);
    }
}

