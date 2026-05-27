package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.dto.response.DistrictStationCountResponse;
import com.team4tech.evbatteryswap.entity.Quanhuyen;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IQuanhuyenService {
    List<Quanhuyen> findByTinhthanhId(Integer tinhthanhId);
    List<DistrictStationCountResponse> findDistrictCountsByProvinceId(@Param("tinhthanhId") Integer tinhthanhId);
}
