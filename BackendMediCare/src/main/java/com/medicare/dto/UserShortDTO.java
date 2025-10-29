package com.medicare.dto;

import lombok.Data;

@Data
public class UserShortDTO {
    private Long userId;
    private String fullName;
    private String emailId;
    private String phoneNumber;
}
