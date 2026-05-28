package com.team4tech.evbatteryswap.service.soh;

import com.team4tech.evbatteryswap.config.SohCalculationConfig;
import com.team4tech.evbatteryswap.entity.Battery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Core engine tính toán SoH (State of Health) cho pin EV.
 *
 * <p><b>Mô hình Hybrid:</b>
 * <pre>
 *   SoH = w_cycle × SoH_cycle  +  w_age × SoH_age
 *
 *   SoH_cycle = 100 − (chargeCycles × cycleDegradationRate)
 *   SoH_age   = 100 − (ageMonths   × calendarDegradationRate)
 *
 *   RUL = (SoH − EOL_threshold) / degradationPerCycle
 * </pre>
 *
 * <p>Không có dependency vào DB — dễ unit test độc lập.
 */
@Component
@RequiredArgsConstructor
public class SohCalculationEngine {

    private final SohCalculationConfig cfg;

    /**
     * Tính SoH đầy đủ cho một pin.
     *
     * @param battery entity pin cần chẩn đoán.
     * @return {@link SohResult} chứa toàn bộ metrics.
     */
    public SohResult calculate(Battery battery) {
        int    cycles    = battery.getChargeCycles()  != null ? battery.getChargeCycles() : 0;
        long   ageMonths = resolveAgeMonths(battery.getManufactureDate());

        BigDecimal sohCycle = computeSohCycle(cycles);
        BigDecimal sohAge   = computeSohAge(ageMonths);
        BigDecimal soh      = computeHybridSoh(sohCycle, sohAge);

        int    rul   = computeRul(soh, cycles, ageMonths);
        String grade = resolveGrade(soh);
        BigDecimal dr = computeDegradationRatePer100Cycles(cycles, soh);

        return new SohResult(soh, sohCycle, sohAge, rul, grade, dr);
    }

    /**
     * SoH theo chu kỳ nạp (cycle-based degradation).
     * Giá trị được clamp về [0, 100].
     */
    private BigDecimal computeSohCycle(int cycles) {
        double raw = 100.0 - (cycles * cfg.getCycleDegradationRate());
        return clamp(raw);
    }

    /**
     * SoH theo tuổi lịch (calendar aging).
     * Nếu chưa có manufactureDate thì giả định pin còn mới (100%).
     */
    private BigDecimal computeSohAge(long ageMonths) {
        double raw = 100.0 - (ageMonths * cfg.getCalendarDegradationRate());
        return clamp(raw);
    }

    /**
     * Hybrid SoH = w_cycle × SoH_cycle + w_age × SoH_age.
     */
    private BigDecimal computeHybridSoh(BigDecimal sohCycle, BigDecimal sohAge) {
        double hybrid = cfg.getCycleWeight()    * sohCycle.doubleValue()
                      + cfg.getCalendarWeight() * sohAge.doubleValue();
        return clamp(hybrid);
    }

    /**
     * Remaining Useful Life tính bằng số chu kỳ nạp còn lại trước khi đạt EOL.
     *
     * <pre>
     *   degradationPerCycle = w_cycle × cycleDegradationRate
     *                       + w_age   × (calendarDegradationRate / avgCyclesPerMonth)
     *   RUL = (SoH − eolThreshold) / degradationPerCycle
     * </pre>
     */
    private int computeRul(BigDecimal soh, int cycles, long ageMonths) {
        double remaining = soh.doubleValue() - cfg.getEolThreshold();
        if (remaining <= 0) return 0;

        double degradationPerCycle =
                cfg.getCycleWeight()    * cfg.getCycleDegradationRate()
              + cfg.getCalendarWeight() * (cfg.getCalendarDegradationRate()
                                          / Math.max(1, cfg.getAvgCyclesPerMonth()));

        if (degradationPerCycle <= 0) return Integer.MAX_VALUE;

        return (int) Math.max(0, Math.floor(remaining / degradationPerCycle));
    }

    /**
     * Tốc độ suy giảm tính trên mỗi 100 chu kỳ nạp (%).
     * Nếu pin chưa có đủ dữ liệu (cycles = 0) thì dùng tốc độ lý thuyết.
     */
    private BigDecimal computeDegradationRatePer100Cycles(int cycles, BigDecimal soh) {
        if (cycles > 0) {
            // Suy giảm thực tế = (100 - SoH) / cycles * 100
            double actual = (100.0 - soh.doubleValue()) / cycles * 100.0;
            return BigDecimal.valueOf(actual).setScale(3, RoundingMode.HALF_UP);
        }
        // Lý thuyết theo config
        double theoretical = cfg.getCycleWeight()    * cfg.getCycleDegradationRate() * 100.0
                           + cfg.getCalendarWeight() * cfg.getCalendarDegradationRate()
                             * (100.0 / Math.max(1, cfg.getAvgCyclesPerMonth()));
        return BigDecimal.valueOf(theoretical).setScale(3, RoundingMode.HALF_UP);
    }

    /**
     * Xếp hạng sức khỏe dựa trên SoH.
     */
    private String resolveGrade(BigDecimal soh) {
        double v = soh.doubleValue();
        if (v >= 90) return "EXCELLENT";
        if (v >= 80) return "GOOD";
        if (v >= 70) return "FAIR";
        if (v >= 50) return "POOR";
        return "CRITICAL";
    }

    /**
     * Tính số tháng kể từ ngày sản xuất đến hôm nay.
     * Trả về 0 nếu manufactureDate null.
     */
    private long resolveAgeMonths(LocalDate manufactureDate) {
        if (manufactureDate == null) return 0L;
        LocalDate today = LocalDate.now();
        if (manufactureDate.isAfter(today)) return 0L;
        return ChronoUnit.MONTHS.between(manufactureDate, today);
    }

    /**
     * Clamp giá trị về [0.00, 100.00] với 2 chữ số thập phân.
     */
    private BigDecimal clamp(double value) {
        double clamped = Math.min(100.0, Math.max(0.0, value));
        return BigDecimal.valueOf(clamped).setScale(2, RoundingMode.HALF_UP);
    }
}
