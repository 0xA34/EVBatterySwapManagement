package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.dto.response.StationCountByProvinceResponse;
import com.team4tech.evbatteryswap.entity.Tinhthanh;

import java.util.List;
import java.util.Optional;

public interface ITinhthanhService {
    List<Tinhthanh> getTinhthanh();
    List<StationCountByProvinceResponse> countStationsByProvince();
}
