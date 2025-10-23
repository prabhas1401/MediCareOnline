package com.medicare.controller;

import java.util.List;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/appointment/{appointmentId}")			//Done	
    public ResponseEntity<ApiResponse<PrescriptionResponseDTO>> addPrescription(@PathVariable Long appointmentId,
                                                        @Valid @RequestBody AddPrescriptionRequest req,
                                                        Authentication authentication) {
        Long doctorUserId = (Long) authentication.getPrincipal();
        Prescription saved = prescriptionService.addPrescription(appointmentId, doctorUserId, req);
        return ResponseEntity.status(201).body(new ApiResponse<>(true, "Prescriptoin added successfully.", PrescriptionMapper.toDto(saved)));
    }

    @GetMapping("/by-current-user")					//Done
    public ResponseEntity<List<PrescriptionResponseDTO>> byUser(Authentication authentication) {
        Long doctorUserId = (Long) authentication.getPrincipal();
        List<PrescriptionResponseDTO> prescriptions  = prescriptionService.findByUserId(doctorUserId)
        		.stream()
                .map(PrescriptionMapper::toDto)
        		.toList();
        return ResponseEntity.ok(prescriptions);
    }
    
    @GetMapping("/{id}")				//Done		
    public ResponseEntity<PrescriptionDetailDto> getPrescription(@PathVariable Long id) {
        PrescriptionDetailDto dto = prescriptionService.getPrescriptionDetails(id);
        return ResponseEntity.ok(dto);
    }
    
    @GetMapping("/{id}/download")				//Done
    public ResponseEntity<byte[]> downloadPrescriptionPdf(@PathVariable Long id) {
        byte[] pdfBytes = prescriptionService.getPrescriptionPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename("prescription_" + id + ".pdf").build());

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

}