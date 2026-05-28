package com.team4tech.evbatteryswap.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Các hằng số cấu hình cho thuật toán tính SoH (State of Health) của pin.
 * Có thể điều chỉnh trong application.properties mà không cần recompile.
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "battery.soh")
public class SohCalculationConfig {

    /**
     * % suy giảm SoH trên mỗi chu kỳ nạp.
     * Mặc định 0.04 → 100 chu kỳ = 4% suy giảm.
     */
    private double cycleDegradationRate = 0.04;

    /**
     * % suy giảm SoH trên mỗi tháng do lão hóa lịch (calendar aging).
     * Mặc định 0.10 → 10 tháng = 1% suy giảm.
     */
    private double calendarDegradationRate = 0.10;

    /**
     * Trọng số của thành phần cycle-based (0.0 – 1.0).
     * cycleWeight + calendarWeight phải = 1.0.
     */
    private double cycleWeight = 0.7;

    /**
     * Trọng số của thành phần calendar-based (0.0 – 1.0).
     */
    private double calendarWeight = 0.3;

    /**
     * Ngưỡng end-of-life: khi SoH xuống dưới ngưỡng này pin bị coi là hết hạn.
     * Mặc định 70%.
     */
    private double eolThreshold = 70.0;

    /**
     * Số chu kỳ nạp trung bình mỗi tháng (dùng để quy đổi RUL từ % sang cycles).
     */
    private int avgCyclesPerMonth = 15;
}
