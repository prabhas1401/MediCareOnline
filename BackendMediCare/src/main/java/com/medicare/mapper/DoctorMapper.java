package com.medicare.mapper;

import java.util.List;

import com.medicare.dto.AppointmentSummaryDto;
import com.medicare.dto.AvailabilityDto;
import com.medicare.dto.DoctorSafeDto;
import com.medicare.entity.Doctor;

public class DoctorMapper {

    public static DoctorSafeDto toSafeDto(Doctor doctor) {
    	
        List<AppointmentSummaryDto> apptList = doctor.getAppointments() != null
                ? doctor.getAppointments().stream()
                        .map(a -> new AppointmentSummaryDto(
                            a.getAppointmentId(),
                            a.getStatus().name(),
                            a.getSpecialization().name(),
                            a.getPreferredDate(),
                            a.getScheduledDateTime(),
                            a.getFee()
                        ))
                        .toList()
                : List.of();

            List<AvailabilityDto> availList = doctor.getAvailability() != null
                ? doctor.getAvailability().stream()
                        .map(av -> new AvailabilityDto(
                            av.getAvailabilityId(),
                            av.getDate(),
                            av.getStartTime().toString(),
                            av.getEndTime().toString(),
                            av.isBooked(),
                            av.isBlocked(),
                            av.getReason()
                        ))
                        .toList()
                : List.of();
            
        return new DoctorSafeDto(
            doctor.getUser().getUserId(),
            doctor.getUser().getFullName(),
            doctor.getUser().getEmailId(),
            doctor.getUser().getPhoneNumber(),
            doctor.getUser().getRole().name(),
            doctor.getUser().getStatus().name(),
            doctor.getUser().getCreatedAt(),
            doctor.getSpecialization().name(),
            doctor.getQualification(),
            doctor.getExperienceYears() != null ? doctor.getExperienceYears() : 0,
            apptList,
            availList
        );
    }
}

