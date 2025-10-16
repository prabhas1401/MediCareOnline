package com.medicare.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.medicare.entity.Availability;
import com.medicare.entity.Doctor;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.AvailabilityRepository;
import com.medicare.repository.DoctorLeaveRepository;
import com.medicare.repository.DoctorRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorLeaveRepository doctorLeaveRepository;

    @Transactional
    public Availability createSlot(Long doctorUserId, Availability slot) {
        Doctor doc = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        // Prevent creating slot when doctor on leave that date
        if (doctorLeaveRepository.existsByDoctorUserUserIdAndLeaveDate(doctorUserId, slot.getDate())) {
            throw new ConflictException("Doctor is on leave on that date");
        }

        // Prevent duplicate free slot
        boolean exists = availabilityRepository.existsByDoctorUserUserIdAndDateAndStartTimeAndBookedFalse(
                doctorUserId, slot.getDate(), slot.getStartTime());
        if (exists) throw new ConflictException("Slot already exists");

        slot.setDoctor(doc);
        slot.setBooked(false);
        return availabilityRepository.save(slot);
    }

    public List<Availability> getAvailableSlotsForDoctor(Long doctorUserId) {
        return availabilityRepository.findByDoctorUserUserIdAndBookedFalse(doctorUserId);
    }

    public List<Availability> getSlotsForDoctorOnDate(Long doctorUserId, LocalDate date) {
        return availabilityRepository.findByDoctorUserUserIdAndDate(doctorUserId, date);
    }
}