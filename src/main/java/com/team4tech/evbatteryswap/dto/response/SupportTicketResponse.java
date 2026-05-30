package com.team4tech.evbatteryswap.dto.response;


import com.team4tech.evbatteryswap.entity.SupportTicket;

import java.time.Instant;

public record SupportTicketResponse(
        Integer id,
        String subject,
        String message,
        Integer userId,
        String username,
        String status,
        String priority,
        String adminResponse,
        Instant createdAt,
        Instant updatedAt
) {
    public static SupportTicketResponse from(SupportTicket supportTicket) {
        return new SupportTicketResponse(
                supportTicket.getId(),
                supportTicket.getSubject(),
                supportTicket.getMessage(),
                supportTicket.getUser() != null ? supportTicket.getUser().getId() : null,
                supportTicket.getUser() != null ? supportTicket.getUser().getUsername() : null,
                supportTicket.getStatus(),
                supportTicket.getPriority(),
                supportTicket.getAdminResponse(),
                supportTicket.getCreatedAt(),
                supportTicket.getUpdatedAt()
        );
    }
}
