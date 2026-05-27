package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.dto.response.WardStationCountResponse;
import com.team4tech.evbatteryswap.entity.Phuongxa;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IPhuongxaService {
    List<Phuongxa> findByQuanhuyenId(Integer quanhuyenId);
    List<WardStationCountResponse> findWardCountsByDistrictId(@Param("quanhuyenId") Integer quanhuyenId);
}
