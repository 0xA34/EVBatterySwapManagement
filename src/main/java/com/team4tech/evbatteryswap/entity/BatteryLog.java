package com.team4tech.evbatteryswap.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Lưu snapshot lịch sử mỗi lần SoH được tính lại.
 * Dùng để theo dõi xu hướng suy giảm pin theo thời gian.
 */
@Getter
@Setter
@Entity
@Table(name = "battery_logs", indexes = {
        @Index(name = "idx_battery_logs_battery_id", columnList = "battery_id"),
        @Index(name = "idx_battery_logs_calculated_at", columnList = "calculated_at")
})
public class BatteryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    /** Pin được chẩn đoán. Xóa log khi pin bị xóa. */
    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "battery_id", nullable = false)
    private Battery battery;

    /** SoH tổng hợp (hybrid) tại thời điểm tính. */
    @Column(name = "soh", nullable = false, precision = 5, scale = 2)
    private BigDecimal soh;

    /** Thành phần SoH theo chu kỳ nạp. */
    @Column(name = "soh_cycle", precision = 5, scale = 2)
    private BigDecimal sohCycle;

    /** Thành phần SoH theo tuổi lịch (calendar aging). */
    @Column(name = "soh_age", precision = 5, scale = 2)
    private BigDecimal sohAge;

    /** State of Charge tại thời điểm tính. */
    @Column(name = "soc", precision = 5, scale = 2)
    private BigDecimal soc;

    /** Số chu kỳ nạp tại thời điểm tính. */
    @Column(name = "charge_cycles")
    private Integer chargeCycles;

    /** Xếp hạng sức khỏe: EXCELLENT / GOOD / FAIR / POOR / CRITICAL. */
    @Column(name = "health_grade", length = 20)
    private String healthGrade;

    /** Remaining Useful Life — số chu kỳ nạp còn lại trước EOL. */
    @Column(name = "rul_cycles")
    private Integer rulCycles;

    /** Tốc độ suy giảm tính trên mỗi 100 chu kỳ (%). */
    @Column(name = "degradation_rate_per_100_cycles", precision = 6, scale = 3)
    private BigDecimal degradationRatePer100Cycles;

    /**
     * Nguồn kích hoạt: SCHEDULED | MANUAL | ON_SWAP | SYSTEM
     */
    @ColumnDefault("'SYSTEM'")
    @Column(name = "trigger_source", length = 20)
    private String triggerSource;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "calculated_at", nullable = false)
    private Instant calculatedAt;
}
