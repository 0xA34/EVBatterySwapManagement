package com.team4tech.evbatteryswap.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "tinhthanh")
public class Tinhthanh {
    @Id
    @Column(name = "idtinhthanh", nullable = false)
    private Integer id;

    @Size(max = 45)
    @NotNull
    @Column(name = "tinhthanhcol", nullable = false, length = 45)
    private String tinhthanhcol;

    @Size(max = 5)
    @NotNull
    @Column(name = "bienso", nullable = false, length = 5)
    private String bienso;

}