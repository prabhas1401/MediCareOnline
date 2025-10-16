package com.medicare.dto;

import lombok.Data;

@Data
public class ReassignRequest {
    public Long newDoctorUserId;
    public Long newAvailabilityId;
}
