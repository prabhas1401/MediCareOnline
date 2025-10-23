package com.medicare.dto;

import com.medicare.entity.Doctor;

import lombok.Data;

@Data
public class DoctorShortDTO {
    private UserShortDTO user;
    private Doctor.Specialization specialization;
    private String qualification;
}
