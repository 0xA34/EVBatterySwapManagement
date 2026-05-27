package com.team4tech.evbatteryswap.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class WardStationCountResponse {
    private Integer id;
    private String tenphuongxa;
    private Long count_station; // Để kiểu Long để khớp với hàm COUNT của Hibernate
}
