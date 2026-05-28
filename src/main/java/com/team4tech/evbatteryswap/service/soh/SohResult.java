package com.team4tech.evbatteryswap.service.soh;

import java.math.BigDecimal;

/**
 * Kết quả tính toán SoH — record nội bộ truyền giữa Engine → Service → DTO.
 *
 * @param soh                         SoH tổng hợp (hybrid), %.
 * @param sohCycle                    Thành phần cycle-based, %.
 * @param sohAge                      Thành phần calendar-based, %.
 * @param rulCycles                   Remaining Useful Life (số chu kỳ còn lại).
 * @param healthGrade                 Xếp hạng: EXCELLENT/GOOD/FAIR/POOR/CRITICAL.
 * @param degradationRatePer100Cycles Tốc độ suy giảm / 100 chu kỳ, %.
 */
public record SohResult(
        BigDecimal soh,
        BigDecimal sohCycle,
        BigDecimal sohAge,
        int        rulCycles,
        String     healthGrade,
        BigDecimal degradationRatePer100Cycles
) {}
