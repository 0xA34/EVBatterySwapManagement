package com.team4tech.evbatteryswap.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "quanhuyen")
public class Quanhuyen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idquanhuyen", nullable = false)
    private Integer id;

    @Size(max = 100)
    @NotNull
    @Column(name = "tenquanhuyen", nullable = false, length = 100)
    private String tenquanhuyen;

}