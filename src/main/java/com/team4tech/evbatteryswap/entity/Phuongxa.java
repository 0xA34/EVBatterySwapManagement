package com.team4tech.evbatteryswap.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "phuongxa")
public class Phuongxa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idphuongxa", nullable = false)
    private Integer id;

    @Size(max = 100)
    @NotNull
    @Column(name = "tenphuongxa", nullable = false, length = 100)
    private String tenphuongxa;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "idquanhuyen", nullable = false)
    private Quanhuyen quanhuyen;

}