package com.example.hms.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.hms.dto.AppointmentDto;
import com.example.hms.dto.ProfileUpdateRequest;
import com.example.hms.dto.ReconsultRequest;
import com.example.hms.entity.Appointment;
import com.example.hms.entity.Bill;
import com.example.hms.entity.Doctor;
import com.example.hms.entity.Patient;
import com.example.hms.entity.Prescription;
import com.example.hms.entity.User;
import com.example.hms.repository.AppointmentRepository;
import com.example.hms.repository.BillRepository;
import com.example.hms.repository.PrescriptionRepository;
import com.example.hms.repository.UserRepository;

@Service
public class PatientService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private PrescriptionRepository prescriptionRepository;
    @Autowired
    private BillRepository billRepository;

    public List<Patient> getAllPatients() {
        return userRepository.findAll().stream().filter(u -> "patient".equals(u.getRole())).map(u -> (Patient) u).collect(Collectors.toList());
    }

    public void deletePatient(Long id) {
        userRepository.deleteById(id);
    }

    public List<User> getDoctors() {
        return userRepository.findAll().stream().filter(u -> "doctor".equals(u.getRole())).collect(Collectors.toList());
    }

    public void bookAppointment(AppointmentDto dto, Long patientId) {
        Appointment appt = new Appointment();
        appt.setPatient((Patient) userRepository.findById(patientId).orElseThrow());
        appt.setDoctor((Doctor) userRepository.findById(dto.getDoctorId()).orElseThrow());
        appt.setDate(dto.getDate());
        appt.setSymptoms(dto.getSymptoms());
        appt.setStatus("pending");
        appointmentRepository.save(appt);
        Bill bill = new Bill();
        bill.setPatient(appt.getPatient());
        bill.setAppointment(appt);
        bill.setAmount(50.0);
        bill.setStatus("paid");
        billRepository.save(bill);
    }

    public List<Appointment> getAppointments(Long patientId) {
        return appointmentRepository.findAll().stream().filter(a -> a.getPatient().getId().equals(patientId)).collect(Collectors.toList());
    }

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }

    public List<Prescription> getPrescriptions(Long patientId) {
        return prescriptionRepository.findAll().stream().filter(p -> p.getPatient().getId().equals(patientId)).collect(Collectors.toList());
    }

    public void uploadRecord(MultipartFile file, Long patientId) {
        // Simulate upload
    }

    public List<Bill> getBillings(Long patientId) {
        return billRepository.findAll().stream().filter(b -> b.getPatient().getId().equals(patientId)).collect(Collectors.toList());
    }

    public void requestReconsult(ReconsultRequest request, Long patientId) {
        // Simulate
    }

    public User getProfile(Long patientId) {
        return userRepository.findById(patientId).orElseThrow();
    }

    public void updateProfile(ProfileUpdateRequest request, Long patientId) {
        Patient patient = (Patient) userRepository.findById(patientId).orElseThrow();
        patient.setName(request.getName());
        patient.setEmail(request.getEmail());
        patient.setDob(request.getDob());
        patient.setMobile(request.getMobile());
        patient.setGender(request.getGender());
        userRepository.save(patient);
    }
}