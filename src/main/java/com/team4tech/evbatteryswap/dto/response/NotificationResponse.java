package com.team4tech.evbatteryswap.dto.response;

import com.team4tech.evbatteryswap.entity.Notification;

import java.time.Instant;

public record NotificationResponse(
        Integer id,
        String title,
        String message,
        String type,
        Boolean isRead,
        Instant createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getIsRead(),
                notification.getCreatedAt()
        );
    }
}
