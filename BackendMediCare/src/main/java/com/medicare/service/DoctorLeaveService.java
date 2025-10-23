package com.medicare.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.medicare.dto.AddLeaveRequest;
import com.medicare.entity.Appointment;
import com.medicare.entity.Doctor;
import com.medicare.entity.DoctorLeave;
import com.medicare.entity.User;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.DoctorLeaveRepository;
import com.medicare.repository.DoctorRepository;
import com.medicare.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorLeaveService {

    private final DoctorLeaveRepository doctorLeaveRepository;
    private final DoctorRepository doctorRepository;
	private final AppointmentRepository appointmentRepository;
	private final UserRepository userRepository;

    @Transactional
    public DoctorLeave addLeave(Long doctorUserId, AddLeaveRequest req) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(doctorUserId, req.date)) {
            throw new ConflictException("Leave already exists for this date");
        }

        LocalDate leaveDate = req.date;

        boolean hasAppointments = appointmentRepository.existsByDoctorUserUserIdAndScheduledDateTimeBetweenAndStatusIn(
                doctorUserId,
                leaveDate.atStartOfDay(),
                leaveDate.atTime(LocalTime.MAX),
                List.of(Appointment.AppointmentStatus.CONFIRMED, Appointment.AppointmentStatus.PENDING)
        );

        if (hasAppointments) {
            throw new ConflictException("Cannot take leave — appointments are scheduled on this date");
        }

        // ✅ Create and save leave
        DoctorLeave leave = new DoctorLeave();
        leave.setDoctor(doctor);
        leave.setLeaveDate(leaveDate);
        leave.setReason(req.reason);

        return doctorLeaveRepository.save(leave);
    }


    public List<DoctorLeave> getLeavesForDoctor(Long doctorUserId, Long actingUserId) {
    	
    	User user = userRepository.findById(actingUserId)
    			.orElseThrow(()->new ResourceNotFoundException("User not found."));
    	
    	if(user.getRole() != User.Role.ADMIN && user.getRole() != User.Role.DOCTOR) {
    		throw new ForbiddenException("Not authorized to access doctor leaves.");
    	}
    	
    	if(user.getRole() == User.Role.DOCTOR && user.getUserId() != doctorUserId) {
    		throw new ForbiddenException("Not allowed to see others' leaves.");
    	}
    	
        return doctorLeaveRepository.findByDoctorUserUserId(doctorUserId);
    }
}
