package com.team4tech.evbatteryswap.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "batteries")
public class Battery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 100)
    @NotNull
    @Column(name = "serial_number", nullable = false, length = 100)
    private String serialNumber;

    @Size(max = 100)
    @NotNull
    @Column(name = "model", nullable = false, length = 100)
    private String model;

    @NotNull
    @Column(name = "capacity_kwh", nullable = false, precision = 8, scale = 2)
    private BigDecimal capacityKwh;

    @NotNull
    @ColumnDefault("0.00")
    @Column(name = "current_charge_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal currentChargePercentage;

    @NotNull
    @ColumnDefault("100.00")
    @Column(name = "health_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal healthPercentage;

    @ColumnDefault("0")
    @Column(name = "charge_cycles")
    private Integer chargeCycles;

    @Size(max = 255)
    @ColumnDefault("'EMPTY'")
    @Column(name = "status")
    private String status;

    @ColumnDefault("0.00")
    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "current_station_id")
    private Station currentStation;

    @OneToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "manufacture_date")
    private LocalDate manufactureDate;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;


}