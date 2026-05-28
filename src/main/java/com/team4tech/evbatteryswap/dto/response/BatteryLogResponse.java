package com.team4tech.evbatteryswap.dto.response;

import com.team4tech.evbatteryswap.entity.BatteryLog;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Một dòng trong lịch sử SoH của pin.
 */
public record BatteryLogResponse(
        Long       id,
        Integer    batteryId,
        BigDecimal soh,
        BigDecimal sohCycle,
        BigDecimal sohAge,
        BigDecimal soc,
        Integer    chargeCycles,
        String     healthGrade,
        Integer    rulCycles,
        BigDecimal degradationRatePer100Cycles,
        String     triggerSource,
        Instant    calculatedAt
) {
    public static BatteryLogResponse from(BatteryLog log) {
        return new BatteryLogResponse(
                log.getId(),
                log.getBattery() != null ? log.getBattery().getId() : null,
                log.getSoh(),
                log.getSohCycle(),
                log.getSohAge(),
                log.getSoc(),
                log.getChargeCycles(),
                log.getHealthGrade(),
                log.getRulCycles(),
                log.getDegradationRatePer100Cycles(),
                log.getTriggerSource(),
                log.getCalculatedAt()
        );
    }
}
