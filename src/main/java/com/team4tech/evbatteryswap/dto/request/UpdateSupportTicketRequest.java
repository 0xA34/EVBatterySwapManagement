package com.team4tech.evbatteryswap.dto.request;

public record UpdateSupportTicketRequest(
        String status,
        String priority,
        String adminResponse
) {
}
