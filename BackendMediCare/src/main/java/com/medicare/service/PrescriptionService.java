package com.medicare.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.medicare.dto.AddPrescriptionRequest;
import com.medicare.dto.PrescriptionDetailDto;
import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;
import com.medicare.entity.Patient;
import com.medicare.entity.Prescription;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.PrescriptionRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;
    private final PrescriptionPdfGenerator pdfGenerator;

    @Transactional
    public Prescription addPrescription(Long appointmentId, Long doctorUserId, AddPrescriptionRequest req) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appt.getDoctor() == null || !appt.getDoctor().getUser().getUserId().equals(doctorUserId)) {
            throw new ForbiddenException("Only assigned doctor may add prescription");
        }

        if (prescriptionRepository.findByAppointment(appt).isPresent()) {
            throw new ConflictException("Prescription already exists for this appointment");
        }

        Prescription p = new Prescription();
        p.setAppointment(appt);
        p.setDiagnosis(req.getDiagnosis());
        p.setMedicines(req.getMedicines());
        p.setAdditionalNotes(req.getAdditionalNotes());
        p.setIssuedAt(java.time.LocalDateTime.now());

        Prescription saved = prescriptionRepository.save(p);

        // generate PDF bytes (store to filestore in your app, here we call stub)
        byte[] pdf = pdfGenerator.generatePdf(saved);
        // TODO: save pdf bytes to object storage and store reference if needed

        // notify patient only (per story)
        emailService.sendPrescriptionAddedEmail(appt.getPatient().getUser().getEmailId(),
                appt.getPatient().getUser().getFullName(),
                appt.getDoctor().getUser().getFullName(),
                req.getDiagnosis(),
                null // optionally pass download URL if persisted
        );

        return saved;
    }
    
    @Transactional
    public PrescriptionDetailDto getPrescriptionDetails(Long prescriptionId) {
        Prescription presc = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        Appointment appt = presc.getAppointment();
        Patient patient = appt.getPatient();
        Doctor doctor = appt.getDoctor();
        
        PrescriptionDetailDto dto = new PrescriptionDetailDto();
        dto.setPrescriptionId(presc.getPrescriptionId());
        dto.setPatientFullName(patient.getUser().getFullName());
        dto.setPatientGender(patient.getGender());
        dto.setPatientDateOfBirth(patient.getDateOfBirth().atStartOfDay()); // convert to LocalDateTime or adjust
        
        dto.setDoctorFullName(doctor.getUser().getFullName());
        dto.setDoctorSpecialization(doctor.getSpecialization().name());
        
        dto.setAppointmentDateTime(appt.getScheduledDateTime());
        
        dto.setDiagnosis(presc.getDiagnosis());
        dto.setMedicines(presc.getMedicines());
        dto.setAdditionalNotes(presc.getAdditionalNotes());
        dto.setIssuedAt(presc.getIssuedAt());

        // Optionally set PDF download URL if implemented
        dto.setPdfDownloadUrl("/api/prescriptions/" + prescriptionId + "/download");

        return dto;
    }

    @Transactional
    public byte[] getPrescriptionPdf(Long prescriptionId) {
        Prescription presc = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        return pdfGenerator.generatePdf(presc);
    }


    public List<Prescription> findByDoctorUserId(Long doctorUserId) {
        return prescriptionRepository.findByAppointmentDoctorUserUserId(doctorUserId);
    }

    public List<Prescription> findByPatientUserId(Long patientUserId) {
        return prescriptionRepository.findByAppointmentPatientUserUserId(patientUserId);
    }
    
    
}
