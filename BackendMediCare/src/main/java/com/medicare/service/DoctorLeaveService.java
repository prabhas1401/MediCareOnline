package com.medicare.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.medicare.entity.Availability;
import com.medicare.entity.Doctor;
import com.medicare.entity.DoctorLeave;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.AvailabilityRepository;
import com.medicare.repository.DoctorLeaveRepository;
import com.medicare.repository.DoctorRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorLeaveService {

    private final DoctorLeaveRepository doctorLeaveRepository;
    private final DoctorRepository doctorRepository;
    private final AvailabilityRepository availabilityRepository;

    @Transactional
    public DoctorLeave addLeave(Long doctorUserId, LocalDate date, String reason) {
        Doctor doc = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(doctorUserId, date)) {
            throw new ConflictException("Leave already exists");
        }

        DoctorLeave leave = new DoctorLeave();
        leave.setDoctor(doc);
        leave.setLeaveDate(date);
        leave.setReason(reason);
        DoctorLeave saved = doctorLeaveRepository.save(leave);

        // mark slots as booked
        List<Availability> slots = availabilityRepository.findByDoctorUserUserIdAndDate(doctorUserId, date);
        for (Availability s : slots) {
            s.setBooked(true);
        }
        availabilityRepository.saveAll(slots);
        return saved;
    }

    public List<DoctorLeave> getLeavesForDoctor(Long doctorUserId) {
        return doctorLeaveRepository.findByDoctorUserUserId(doctorUserId);
    }
}
