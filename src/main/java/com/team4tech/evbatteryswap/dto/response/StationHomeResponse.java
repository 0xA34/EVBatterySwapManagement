package com.team4tech.evbatteryswap.dto.response;

import com.team4tech.evbatteryswap.entity.Station;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StationHomeResponse {
    private Station station;
    private List<BatteryStatusCountResponse> batteryStatusCounts;
}