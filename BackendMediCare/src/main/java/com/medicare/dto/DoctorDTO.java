package com.medicare.dto;
	
import com.medicare.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDTO {
    private Long userId;
    private String fullName;
    private String emailId;
    private String phoneNumber;
    private User.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String specialization;
    private String qualification;
    private Integer experienceYears;
}
