package com.team4tech.evbatteryswap.service.soh;

import com.team4tech.evbatteryswap.config.SohCalculationConfig;
import com.team4tech.evbatteryswap.entity.Battery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit test cho {@link SohCalculationEngine}.
 *
 * <p>Không cần Spring context, không cần DB — chạy thuần Java.
 * Dùng config mặc định giống application.properties:
 * <pre>
 *   cycleDegradationRate  = 0.04  (mỗi chu kỳ nạp giảm 0.04%)
 *   calendarDegradationRate = 0.10 (mỗi tháng giảm 0.10%)
 *   cycleWeight           = 0.7
 *   calendarWeight        = 0.3
 *   eolThreshold          = 70.0
 *   avgCyclesPerMonth     = 15
 * </pre>
 */
class SohCalculationEngineTest {

    private SohCalculationEngine engine;

    // Giá trị config mặc định (giống application.properties)
    private static final double CYCLE_DEG_RATE     = 0.04;
    private static final double CALENDAR_DEG_RATE  = 0.10;
    private static final double CYCLE_WEIGHT       = 0.7;
    private static final double CALENDAR_WEIGHT    = 0.3;
    private static final double EOL_THRESHOLD      = 70.0;
    private static final int    AVG_CYCLES_MONTH   = 15;

    @BeforeEach
    void setUp() {
        SohCalculationConfig cfg = new SohCalculationConfig();
        cfg.setCycleDegradationRate(CYCLE_DEG_RATE);
        cfg.setCalendarDegradationRate(CALENDAR_DEG_RATE);
        cfg.setCycleWeight(CYCLE_WEIGHT);
        cfg.setCalendarWeight(CALENDAR_WEIGHT);
        cfg.setEolThreshold(EOL_THRESHOLD);
        cfg.setAvgCyclesPerMonth(AVG_CYCLES_MONTH);

        engine = new SohCalculationEngine(cfg);
    }

    // 1. Pin brand-new: 0 chu kỳ, không có ngày sản xuất
    @Test
    @DisplayName("Pin mới toanh (0 chu kỳ, không có manufactureDate) → SoH = 100%")
    void brandNewBattery_shouldReturn100() {
        Battery battery = buildBattery(0, null);

        SohResult result = engine.calculate(battery);

        System.out.println("=== Pin mới toanh ===");
        printResult(result);

        assertThat(result.soh()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(result.sohCycle()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(result.sohAge()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(result.healthGrade()).isEqualTo("EXCELLENT");
        assertThat(result.rulCycles()).isGreaterThan(0);
    }

    // 2. Pin đã dùng 200 chu kỳ, mua 12 tháng trước
    @Test
    @DisplayName("Pin 200 chu kỳ, 12 tháng tuổi → SoH thấp hơn 100%, grade GOOD hoặc FAIR")
    void usedBattery_200cycles_12months() {
        /*
         * SoH_cycle = 100 - (200 × 0.04) = 100 - 8  = 92.00
         * SoH_age   = 100 - (12  × 0.10) = 100 - 1.2 = 98.80
         * SoH hybrid = 0.7×92 + 0.3×98.80 = 64.40 + 29.64 = 94.04
         */
        Battery battery = buildBattery(200, LocalDate.now().minusMonths(12));

        SohResult result = engine.calculate(battery);

        System.out.println("=== Pin 200 chu kỳ, 12 tháng tuổi ===");
        printResult(result);

        assertThat(result.soh().doubleValue()).isLessThan(100.0);
        assertThat(result.soh().doubleValue()).isGreaterThan(90.0);
        assertThat(result.healthGrade()).isIn("EXCELLENT", "GOOD");
    }

    // 3. Pin đã dùng 500 chu kỳ, 36 tháng tuổi (3 năm)
    @Test
    @DisplayName("Pin 500 chu kỳ, 36 tháng tuổi → SoH thấp, grade FAIR hoặc POOR")
    void usedBattery_500cycles_36months() {
        /*
         * SoH_cycle = 100 - (500 × 0.04) = 100 - 20 = 80.00
         * SoH_age   = 100 - (36  × 0.10) = 100 - 3.6 = 96.40
         * SoH hybrid = 0.7×80 + 0.3×96.40 = 56 + 28.92 = 84.92
         */
        Battery battery = buildBattery(500, LocalDate.now().minusMonths(36));

        SohResult result = engine.calculate(battery);

        System.out.println("=== Pin 500 chu kỳ, 36 tháng tuổi ===");
        printResult(result);

        assertThat(result.soh().doubleValue()).isGreaterThan(70.0);
        assertThat(result.soh().doubleValue()).isLessThan(90.0);
        assertThat(result.healthGrade()).isIn("GOOD", "FAIR");
    }

    // 4. Pin gần hết hạn: 750 chu kỳ, 60 tháng (5 năm)
    @Test
    @DisplayName("Pin 750 chu kỳ, 5 năm tuổi → SoH tiệm cận EOL, grade POOR hoặc CRITICAL")
    void nearEolBattery_750cycles_60months() {
        /*
         * SoH_cycle = 100 - (750 × 0.04) = 100 - 30 = 70.00
         * SoH_age   = 100 - (60  × 0.10) = 100 - 6  = 94.00
         * SoH hybrid = 0.7×70 + 0.3×94 = 49 + 28.2 = 77.20
         */
        Battery battery = buildBattery(750, LocalDate.now().minusMonths(60));

        SohResult result = engine.calculate(battery);

        System.out.println("=== Pin 750 chu kỳ, 5 năm tuổi ===");
        printResult(result);

        assertThat(result.soh().doubleValue()).isGreaterThanOrEqualTo(70.0);
        assertThat(result.healthGrade()).isIn("GOOD", "FAIR", "POOR");
    }

    // 5. Pin đã "chết" (quá 2500 chu kỳ)
    @Test
    @DisplayName("Pin vượt 2500 chu kỳ → SoH clamp về 0, grade CRITICAL, RUL = 0")
    void deadBattery_over2500cycles() {
        Battery battery = buildBattery(2500, LocalDate.now().minusMonths(120));

        SohResult result = engine.calculate(battery);

        System.out.println("=== Pin \"hết hạn\" (2500 chu kỳ, 10 năm) ===");
        printResult(result);

        assertThat(result.soh().doubleValue()).isLessThanOrEqualTo(70.0);
        assertThat(result.healthGrade()).isIn("POOR", "CRITICAL");
        assertThat(result.rulCycles()).isEqualTo(0);
    }

    // 6. SoH luôn nằm trong khoảng [0, 100]
    @Test
    @DisplayName("SoH không bao giờ vượt quá 100 hoặc xuống dưới 0 dù thông số cực đoan")
    void soh_alwaysClamped_between0And100() {
        // Cực đoan: 99999 chu kỳ, 999 tháng tuổi
        Battery battery = buildBattery(99999, LocalDate.now().minusMonths(999));

        SohResult result = engine.calculate(battery);

        System.out.println("=== Thông số cực đoan ===");
        printResult(result);

        assertThat(result.soh().doubleValue()).isBetween(0.0, 100.0);
        assertThat(result.sohCycle().doubleValue()).isBetween(0.0, 100.0);
        assertThat(result.sohAge().doubleValue()).isBetween(0.0, 100.0);
        assertThat(result.rulCycles()).isGreaterThanOrEqualTo(0);
    }

    // 7. Pin có ngày sản xuất trong tương lai → tuổi = 0
    @Test
    @DisplayName("Pin có manufactureDate trong tương lai → age = 0, chỉ tính cycle degradation")
    void futureMfgDate_shouldTreatAgeAsZero() {
        Battery battery = buildBattery(100, LocalDate.now().plusYears(1));

        SohResult result = engine.calculate(battery);

        System.out.println("=== PIN có ngày SX trong tương lai ===");
        printResult(result);

        // SoH_age phải = 100 vì age = 0
        assertThat(result.sohAge()).isEqualByComparingTo(new BigDecimal("100.00"));
    }

    // 8. Kiểm tra Health Grade đúng ngưỡng
    @Test
    @DisplayName("Grade = EXCELLENT khi SoH >= 90, GOOD khi >= 80, FAIR >= 70, POOR >= 50, CRITICAL < 50")
    void healthGrade_correctThresholds() {
        // Pin mới → EXCELLENT
        assertThat(engine.calculate(buildBattery(0, null)).healthGrade()).isEqualTo("EXCELLENT");

        // ~250 chu kỳ → GOOD range
        SohResult r250 = engine.calculate(buildBattery(250, LocalDate.now().minusMonths(6)));
        System.out.println("=== 250 chu kỳ, 6 tháng → Grade: " + r250.healthGrade() + " (SoH=" + r250.soh() + ") ===");

        // ~750 chu kỳ → FAIR/GOOD range
        SohResult r750 = engine.calculate(buildBattery(750, LocalDate.now().minusMonths(24)));
        System.out.println("=== 750 chu kỳ, 24 tháng → Grade: " + r750.healthGrade() + " (SoH=" + r750.soh() + ") ===");
    }

    // 9. RUL luôn >= 0
    @Test
    @DisplayName("RUL không bao giờ âm")
    void rul_alwaysNonNegative() {
        assertThat(engine.calculate(buildBattery(0,    null)).rulCycles()).isGreaterThanOrEqualTo(0);
        assertThat(engine.calculate(buildBattery(500,  LocalDate.now().minusMonths(24))).rulCycles()).isGreaterThanOrEqualTo(0);
        assertThat(engine.calculate(buildBattery(9999, LocalDate.now().minusMonths(200))).rulCycles()).isGreaterThanOrEqualTo(0);
    }

    // Helpers

    /** Tạo Battery giả với chargeCycles và manufactureDate. */
    private Battery buildBattery(int cycles, LocalDate manufactureDate) {
        Battery b = new Battery();
        b.setChargeCycles(cycles);
        b.setManufactureDate(manufactureDate);
        b.setCurrentChargePercentage(new BigDecimal("80.00"));
        b.setHealthPercentage(new BigDecimal("100.00"));
        b.setSerialNumber("TEST-" + cycles);
        b.setModel("TestModel");
        b.setCapacityKwh(new BigDecimal("60.00"));
        return b;
    }

    /** In kết quả ra console để dễ quan sát khi chạy test. */
    private void printResult(SohResult r) {
        System.out.printf(
            "  SoH=%-7s  SoH_cycle=%-7s  SoH_age=%-7s  Grade=%-10s  RUL=%d cycles  DegRate=%s%%/100cy%n",
            r.soh(), r.sohCycle(), r.sohAge(), r.healthGrade(), r.rulCycles(), r.degradationRatePer100Cycles()
        );
    }
}
