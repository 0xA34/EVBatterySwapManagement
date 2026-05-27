package com.team4tech.evbatteryswap.dto.response;

import com.team4tech.evbatteryswap.entity.Battery;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record BatteryResponse(
        Integer id,
        String serialNumber,
        String model,
        BigDecimal capacityKwh,
        BigDecimal currentChargePercentage,
        BigDecimal healthPercentage,
        Integer chargeCycles,
        String status,
        BigDecimal amount,
        Integer currentStationId,
        String currentStationName,
        Integer userId,
        String userUsername,
        LocalDate manufactureDate,
        Instant createdAt,
        Instant updatedAt
) {
    public static BatteryResponse from(Battery b) {
        return new BatteryResponse(
                b.getId(),
                b.getSerialNumber(),
                b.getModel(),
                b.getCapacityKwh(),
                b.getCurrentChargePercentage(),
                b.getHealthPercentage(),
                b.getChargeCycles(),
                b.getStatus(),
                b.getAmount(),
                b.getCurrentStation() != null ? b.getCurrentStation().getId()   : null,
                b.getCurrentStation() != null ? b.getCurrentStation().getName() : null,
                b.getUser()           != null ? b.getUser().getId()             : null,
                b.getUser()           != null ? b.getUser().getUsername()       : null,
                b.getManufactureDate(),
                b.getCreatedAt(),
                b.getUpdatedAt()
        );
    }
}
