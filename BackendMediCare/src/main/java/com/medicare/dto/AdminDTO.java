package com.medicare.dto;

import java.time.LocalDateTime;

import com.medicare.entity.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDTO {
	private Long adminId;
	private String fullName;
	private String emailId;
	private String phoneNumber;
	private User.Status status;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private boolean superAdmin;
}
