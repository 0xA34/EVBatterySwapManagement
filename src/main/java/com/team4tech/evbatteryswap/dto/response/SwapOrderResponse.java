package com.team4tech.evbatteryswap.dto.response;

import com.team4tech.evbatteryswap.entity.BatterySwapOrder;
import lombok.Builder;

import java.time.Instant;
import java.math.BigDecimal;

@Builder
public record SwapOrderResponse(
        Integer id,
        Integer driverId,
        String driverUsername,
        String driverFullName,
        Integer stationId,
        String stationName,
        Integer oldBatteryId,
        String oldBatterySerial,
        Integer newBatteryId,
        String newBatterySerial,
        String orderType,
        String status,
        String rejectReason,
        Instant createdAt,
        Instant expiresAt,
        Instant scheduledAt,
        String voucherCode,
        BigDecimal basePrice,
        BigDecimal discountAmount,
        BigDecimal finalPrice
) {
    public static SwapOrderResponse from(BatterySwapOrder order) {
        return SwapOrderResponse.builder()
                .id(order.getId())
                .driverId(order.getDriver().getId())
                .driverUsername(order.getDriver().getUsername())
                .driverFullName(order.getDriver().getFullName())
                .stationId(order.getStation().getId())
                .stationName(order.getStation().getName())
                .oldBatteryId(order.getOldBattery() != null ? order.getOldBattery().getId() : null)
                .oldBatterySerial(order.getOldBattery() != null ? order.getOldBattery().getSerialNumber() : null)
                .newBatteryId(order.getNewBattery() != null ? order.getNewBattery().getId() : null)
                .newBatterySerial(order.getNewBattery() != null ? order.getNewBattery().getSerialNumber() : null)
                .orderType(order.getOrderType())
                .status(order.getStatus())
                .rejectReason(order.getRejectReason())
                .createdAt(order.getCreatedAt())
                .expiresAt(order.getExpiresAt())
                .scheduledAt(order.getScheduledAt())
                .voucherCode(order.getVoucher() != null ? order.getVoucher().getCode() : null)
                .basePrice(order.getBasePrice())
                .discountAmount(order.getDiscountAmount())
                .finalPrice(order.getFinalPrice())
                .build();
    }
}
