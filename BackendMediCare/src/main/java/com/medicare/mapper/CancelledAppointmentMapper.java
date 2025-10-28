package com.medicare.mapper;

import org.springframework.stereotype.Component;

import com.medicare.dto.AppointmentSummaryForCancelDTO;
import com.medicare.dto.CancelledAppointmentDTO;
import com.medicare.dto.DoctorShortDTO;
import com.medicare.dto.PatientSummaryDTO;
import com.medicare.dto.UserShortDTO;
import com.medicare.entity.Appointment;
import com.medicare.entity.CancelledAppointment;
import com.medicare.entity.Doctor;
import com.medicare.entity.Patient;
import com.medicare.entity.User;

@Component
public class CancelledAppointmentMapper {

    public CancelledAppointmentDTO toDTO(CancelledAppointment entity) {
        if (entity == null) return null;

        CancelledAppointmentDTO dto = new CancelledAppointmentDTO();
        dto.setId(entity.getId());
        dto.setReason(entity.getReason());
        dto.setCancelledAt(entity.getCancelledAt());

        dto.setAppointment(toAppointmentSummary(entity.getAppointment()));
        dto.setCancelledByDoctor(toDoctorShort(entity.getCancelledByDoctor()));
        dto.setPreviousScheduledDateTime(entity.getPreviousScheduledDateTime());
        if (entity.getAppointment() != null && entity.getAppointment().getDoctor() != null) {
            dto.setDoctorName(entity.getAppointment().getDoctor().getUser().getFullName());
            dto.setSpecialization(entity.getAppointment().getDoctor().getSpecialization().name());
        }
        dto.setCancellationDateTime(entity.getCancelledAt());
        dto.setCancelledBy(entity.getCancelledByDoctor() != null ? entity.getCancelledByDoctor().getUser().getFullName() : "System/Admin");
        return dto;
    }

    private AppointmentSummaryForCancelDTO toAppointmentSummary(Appointment appt) {
        if (appt == null) return null;

        AppointmentSummaryForCancelDTO dto = new AppointmentSummaryForCancelDTO();
        dto.setAppointmentId(appt.getAppointmentId());
        dto.setPatient(toPatientSummary(appt.getPatient()));
        dto.setStatus(appt.getStatus().name());
        dto.setSpecialization(appt.getSpecialization());
        dto.setSymptoms(appt.getSymptoms());
        dto.setAdditionalSymptoms(appt.getAdditionalSymptoms());
        dto.setPreferredDate(appt.getPreferredDate());
        dto.setScheduledDateTime(appt.getScheduledDateTime());
        dto.setCreatedAt(appt.getCreatedAt());
        dto.setUpdatedAt(appt.getUpdatedAt());
        dto.setReconsult(appt.isReconsult());
        return dto;
    }

    private PatientSummaryDTO toPatientSummary(Patient patient) {
        if (patient == null) return null;

        PatientSummaryDTO dto = new PatientSummaryDTO();
        dto.setUserId(patient.getUser().getUserId());
        dto.setFullName(patient.getUser().getFullName());
        dto.setEmailId(patient.getUser().getEmailId());
        dto.setPhoneNumber(patient.getUser().getPhoneNumber());
        dto.setGender(patient.getGender().name());
        dto.setDateOfBirth(patient.getDateOfBirth().toString());
        return dto;
    }

    private DoctorShortDTO toDoctorShort(Doctor doctor) {
        if (doctor == null) return null;

        DoctorShortDTO dto = new DoctorShortDTO();
        dto.setUser(toUserShort(doctor.getUser()));
        dto.setSpecialization(doctor.getSpecialization());
        dto.setQualification(doctor.getQualification());
        return dto;
    }

    private UserShortDTO toUserShort(User user) {
        if (user == null) return null;

        UserShortDTO dto = new UserShortDTO();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmailId(user.getEmailId());
        dto.setPhoneNumber(user.getPhoneNumber());
        return dto;
    }
}