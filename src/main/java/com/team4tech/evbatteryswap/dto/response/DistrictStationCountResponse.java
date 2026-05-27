package com.team4tech.evbatteryswap.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DistrictStationCountResponse {
    private Integer id;
    private String tenquanhuyen;
    private Long count_station; // Số lượng trạm, để Long để tránh lỗi ép kiểu của Hibernate COUNT
}