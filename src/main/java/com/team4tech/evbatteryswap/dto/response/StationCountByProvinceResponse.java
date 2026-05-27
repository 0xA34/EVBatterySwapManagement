package com.team4tech.evbatteryswap.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class StationCountByProvinceResponse {
    private String bienso;
    private Integer id;
    private String tinhthanhcol;
    private Long count_station;
}