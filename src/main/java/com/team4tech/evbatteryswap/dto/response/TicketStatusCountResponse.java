package com.team4tech.evbatteryswap.dto.response; // Đổi package theo project của bạn

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketStatusCountResponse {
    private String status;
    private Long count;
}