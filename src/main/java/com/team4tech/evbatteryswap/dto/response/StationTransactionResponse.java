package com.team4tech.evbatteryswap.dto.response;

import com.team4tech.evbatteryswap.entity.StationTransaction;

import java.math.BigDecimal;
import java.time.Instant;

public record StationTransactionResponse(
        Integer id,
        Integer stationId,
        String stationName,
        Integer orderId,
        BigDecimal amount,
        String type,
        String description,
        Instant createdAt
) {
    public static StationTransactionResponse from(StationTransaction t) {
        if (t == null) return null;
        return new StationTransactionResponse(
                t.getId(),
                t.getStation().getId(),
                t.getStation().getName(),
                t.getOrder() != null ? t.getOrder().getId() : null,
                t.getAmount(),
                t.getType(),
                t.getDescription(),
                t.getCreatedAt()
        );
    }
}
