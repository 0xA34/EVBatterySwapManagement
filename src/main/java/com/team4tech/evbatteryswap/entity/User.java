package com.team4tech.evbatteryswap.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "username", nullable = false)
    private String username;

    @Size(max = 255)
    @NotNull
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Size(max = 255)
    @ColumnDefault("NULL")
    @Column(name = "email")
    private String email;

    @Size(max = 20)
    @ColumnDefault("NULL")
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Size(max = 255)
    @NotNull
    @Column(name = "password", nullable = false)
    private String password;

    @ColumnDefault("0.00")
    @Column(name = "wallet_balance", precision = 12, scale = 2)
    private BigDecimal walletBalance;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_stations",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "station_id")
    )
    private List<Station> stations = new ArrayList<>();

    @Size(max = 255)
    @ColumnDefault("'DRIVER'")
    @Column(name = "role")
    private String role;

    @Column(name = "status", length = Integer.MAX_VALUE)
    private String status;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

    @ColumnDefault("0")
    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @Column(name = "lockout_until")
    private Instant lockoutUntil;

}