package com.medicare.dto;

import lombok.Data;

@Data
public class CancelRequest {
    public boolean byAdmin = false;
    public String reason;
}
