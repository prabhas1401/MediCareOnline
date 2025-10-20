package com.example.hms.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.hms.entity.Appointment;
import com.example.hms.service.AppointmentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

@RestController
@RequestMapping("/api/patient/appointments")
@CrossOrigin(origins = "*")
public class PatientAppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Value("${razorpay.keyId}")
    private String keyId;

    @Value("${razorpay.keySecret}")
    private String keySecret;


    // Get all appointments for a patient
    @GetMapping
    public ResponseEntity<List<Appointment>> getAppointments(@RequestParam Long patientId) {
        List<Appointment> appointments = appointmentService.getAllAppointments().stream()
                .filter(a -> a.getPatient().getId().equals(patientId))
                .collect(Collectors.toList());
        return ResponseEntity.ok(appointments);
    }

    // Book a new appointment
    @PostMapping("/book")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody Appointment appointment) {
        Appointment saved = appointmentService.bookAppointment(appointment);
        return ResponseEntity.ok(saved);
    }

    // Create Razorpay order
    @PostMapping("/{id}/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            // Amount in paise (integer)
            int amount = (int) data.get("amount");

            // Initialize Razorpay client
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            // Create order request using JSONObject
            JSONObject options = new JSONObject();
            options.put("amount", amount); // amount in paise
            options.put("currency", "INR");
            options.put("receipt", "order_rcptid_" + id);
            options.put("payment_capture", 1); // auto-capture

            // Create order
            Order order = client.Orders.create(options);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("currency", order.get("currency"));
            response.put("amount", order.get("amount"));
            response.put("key", keyId);

            return ResponseEntity.ok(response);

        } catch (RazorpayException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Unable to create order"));
        }
    }

    // Pay for an appointment
    @PostMapping("/{id}/pay")
    public ResponseEntity<?> payAppointment(@PathVariable Long id, @RequestBody Map<String, Object> paymentData) {
        Appointment appt = appointmentService.getAllAppointments().stream()
                .filter(a -> a.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appt.setStatus("paid");
        appointmentService.bookAppointment(appt); // save updated status
        return ResponseEntity.ok(Map.of("message", "Payment successful"));
    }

    // Cancel an appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(Map.of("message", "Appointment deleted"));
    }
}
