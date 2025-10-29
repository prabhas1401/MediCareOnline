
package com.medicare.mapper;

import com.medicare.dto.AppointmentSummary;
import com.medicare.dto.DoctorSummaryDTO;
import com.medicare.dto.PatientSummaryDTO;
import com.medicare.dto.PrescriptionResponseDTO;
import com.medicare.entity.Appointment;
import com.medicare.entity.Prescription;

public class PrescriptionMapper {

    public static PrescriptionResponseDTO toDto(Prescription entity) {
        if (entity == null) return null;

        PrescriptionResponseDTO dto = new PrescriptionResponseDTO();
        dto.setPrescriptionId(entity.getPrescriptionId());
        dto.setDiagnosis(entity.getDiagnosis());
        dto.setMedicines(entity.getMedicines());
        dto.setAdditionalNotes(entity.getAdditionalNotes());
        dto.setIssuedAt(entity.getIssuedAt());

        Appointment appt = entity.getAppointment();
        AppointmentSummary aDto= new AppointmentSummary();
        aDto.setAppointmentId(appt.getAppointmentId());
        aDto.setStatus(appt.getStatus().name());
        aDto.setSpecialization(appt.getSpecialization());
        aDto.setSymptoms(appt.getSymptoms());
        aDto.setAdditionalSymptoms(appt.getAdditionalSymptoms());
        aDto.setPreferredDate(appt.getPreferredDate());
        aDto.setScheduledDateTime(appt.getScheduledDateTime());
        aDto.setCreatedAt(appt.getCreatedAt());
        aDto.setUpdatedAt(appt.getUpdatedAt());
        aDto.setReconsult(appt.isReconsult());
        

        // Patient
        PatientSummaryDTO pDto = new PatientSummaryDTO();
        pDto.setUserId(appt.getPatient().getUser().getUserId());
        pDto.setFullName(appt.getPatient().getUser().getFullName());
        pDto.setEmailId(appt.getPatient().getUser().getEmailId());
        pDto.setPhoneNumber(appt.getPatient().getUser().getPhoneNumber());
        pDto.setGender(appt.getPatient().getGender().name());
        pDto.setDateOfBirth(appt.getPatient().getDateOfBirth().toString());
        aDto.setPatient(pDto);

        // Doctor
        DoctorSummaryDTO dDto = new DoctorSummaryDTO();
        dDto.setUserId(appt.getDoctor().getUser().getUserId());
        dDto.setFullName(appt.getDoctor().getUser().getFullName());
        dDto.setEmailId(appt.getDoctor().getUser().getEmailId());
        dDto.setPhoneNumber(appt.getDoctor().getUser().getPhoneNumber());
        dDto.setSpecialization(appt.getDoctor().getSpecialization());
        dDto.setQualification(appt.getDoctor().getQualification());
        dDto.setExperienceYears(appt.getDoctor().getExperienceYears());
        aDto.setDoctor(dDto);

        dto.setAppointment(aDto);
        return dto;
    }
        
        
}
