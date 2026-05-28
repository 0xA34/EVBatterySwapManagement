package com.team4tech.evbatteryswap.dto.response;

import com.team4tech.evbatteryswap.entity.Battery;
import com.team4tech.evbatteryswap.service.soh.SohResult;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Kết quả chẩn đoán đầy đủ trả về cho client.
 */
public record BatteryDiagnosticsResponse(
        Integer    batteryId,
        String     serialNumber,
        String     model,

        /** SoH tổng hợp (hybrid), % */
        BigDecimal soh,
        /** Thành phần cycle-based, % */
        BigDecimal sohCycle,
        /** Thành phần calendar-based, % */
        BigDecimal sohAge,
        /** State of Charge hiện tại, % */
        BigDecimal soc,

        /** EXCELLENT / GOOD / FAIR / POOR / CRITICAL */
        String     healthGrade,

        int        chargeCycles,

        /** Remaining Useful Life tính bằng số chu kỳ nạp */
        int        rulCycles,

        /** % suy giảm trên mỗi 100 chu kỳ nạp */
        BigDecimal degradationRatePer100Cycles,

        LocalDate  manufactureDate,

        /** Tuổi pin tính bằng tháng */
        long       ageMonths,

        /** Thời điểm tính toán */
        Instant    calculatedAt
) {
    public static BatteryDiagnosticsResponse from(Battery battery, SohResult result) {
        long ageMonths = 0L;
        if (battery.getManufactureDate() != null) {
            LocalDate today = LocalDate.now();
            if (!battery.getManufactureDate().isAfter(today)) {
                ageMonths = ChronoUnit.MONTHS.between(battery.getManufactureDate(), today);
            }
        }

        return new BatteryDiagnosticsResponse(
                battery.getId(),
                battery.getSerialNumber(),
                battery.getModel(),
                result.soh(),
                result.sohCycle(),
                result.sohAge(),
                battery.getCurrentChargePercentage(),
                result.healthGrade(),
                battery.getChargeCycles() != null ? battery.getChargeCycles() : 0,
                result.rulCycles(),
                result.degradationRatePer100Cycles(),
                battery.getManufactureDate(),
                ageMonths,
                Instant.now()
        );
    }
}
