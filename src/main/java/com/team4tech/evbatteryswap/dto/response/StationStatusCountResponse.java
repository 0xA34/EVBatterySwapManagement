package com.team4tech.evbatteryswap.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StationStatusCountResponse {
    private String status;
    private long count;
}


