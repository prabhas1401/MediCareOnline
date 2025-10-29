
package com.medicare.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicare.dto.AddPrescriptionRequest;
import com.medicare.dto.ApiResponse;
import com.medicare.dto.PrescriptionDetailDto;
import com.medicare.dto.PrescriptionResponseDTO;
import com.medicare.entity.Prescription;
import com.medicare.mapper.PrescriptionMapper;
import com.medicare.service.PrescriptionService;
import com.medicare.util.JwtUtil;  // Added import

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * PrescriptionController
 *
 * - Only assigned doctor may add a prescription for an appointment.
 * - Once created cannot be edited.
 * - Patients, doctors, admins can fetch prescriptions (service methods available).
 */
@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final JwtUtil jwtUtil;  // Added injection

    @PostMapping("/appointment/{appointmentId}")  // Done (kept original, removed duplicate)
    public ResponseEntity<ApiResponse<PrescriptionResponseDTO>> addPrescription(@PathVariable Long appointmentId,
                                                        @Valid @RequestBody AddPrescriptionRequest req,
                                                        Authentication authentication) {
        try {
            Long doctorUserId = (Long) authentication.getPrincipal();
            Prescription saved = prescriptionService.addPrescription(appointmentId, doctorUserId, req);
            return ResponseEntity.status(201).body(new ApiResponse<>(true, "Prescription added successfully.", PrescriptionMapper.toDto(saved)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Error adding prescription: " + e.getMessage(), null));
        }
    }

    @GetMapping("/by-current-user")  // Done
    public ResponseEntity<List<PrescriptionResponseDTO>> byUser(Authentication authentication) {
        try {
            Long doctorUserId = (Long) authentication.getPrincipal();
            List<PrescriptionResponseDTO> prescriptions = prescriptionService.findByUserId(doctorUserId)
                    .stream()
                    .map(PrescriptionMapper::toDto)
                    .toList();
            return ResponseEntity.ok(prescriptions);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(List.of());  // Return empty list on error
        }
    }

    @GetMapping("/{id}")  // Done
    public ResponseEntity<PrescriptionDetailDto> getPrescription(@PathVariable Long id) {
        try {
            PrescriptionDetailDto dto = prescriptionService.getPrescriptionDetails(id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(null);  // Or handle as needed
        }
    }
    
    @GetMapping("/{id}/download")  // Done
    public ResponseEntity<byte[]> downloadPrescriptionPdf(@PathVariable Long id) {
        try {
            byte[] pdfBytes = prescriptionService.getPrescriptionPdf(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder("attachment")
                    .filename("prescription_" + id + ".pdf").build());

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // ---------- Patient-specific Request Refill ----------
    @PostMapping("/{id}/refill")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> requestRefill(@PathVariable Long id, Authentication auth) {
        try {
            Long patientUserId = (Long) auth.getPrincipal();
            prescriptionService.requestRefill(id, patientUserId);  // Ensure this method exists in PrescriptionService
            return ResponseEntity.ok("Refill requested successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error requesting refill: " + e.getMessage());
        }
    }

    // ---------- Patient-specific Book Follow-up ----------
    @PostMapping("/{id}/follow-up")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> bookFollowUp(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
        try {
            Long patientUserId = (Long) auth.getPrincipal();
            String preferredDate = payload.get("preferredDate");
            prescriptionService.bookFollowUp(id, patientUserId, preferredDate);  // Ensure this method exists in PrescriptionService
            return ResponseEntity.ok("Follow-up booked successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error booking follow-up: " + e.getMessage());
        }
    }
}
