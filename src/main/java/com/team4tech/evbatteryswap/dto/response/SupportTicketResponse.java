package com.team4tech.evbatteryswap.dto.response;


import com.team4tech.evbatteryswap.entity.SupportTicket;

import java.time.Instant;

public record SupportTicketResponse(
        Integer id,
        String subject,
        String message,
        String status,
        String priority,
        Instant createdAt,
        Instant updatedAt
) {
    public static SupportTicketResponse from(SupportTicket supportTicket) {
        return new SupportTicketResponse(
                supportTicket.getId(),
                supportTicket.getSubject(),
                supportTicket.getMessage(),
                supportTicket.getStatus(),
                supportTicket.getPriority(),
                supportTicket.getCreatedAt(),
                supportTicket.getUpdatedAt()
        );
    }
}
