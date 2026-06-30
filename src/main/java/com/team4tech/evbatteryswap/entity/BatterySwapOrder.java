package com.team4tech.evbatteryswap.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "battery_swap_orders")
public class BatterySwapOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "old_battery_id")
    private Battery oldBattery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_battery_id")
    private Battery newBattery;

    @Column(name = "order_type", nullable = false, length = 20)
    private String orderType;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "reject_reason")
    private String rejectReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @Column(name = "base_price", precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "final_price", precision = 12, scale = 2)
    private BigDecimal finalPrice;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
