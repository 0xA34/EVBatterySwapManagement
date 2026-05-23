package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.entity.Phuongxa;

import java.util.List;

public interface IPhuongxaService {
    List<Phuongxa> findByQuanhuyenId(Integer quanhuyenId);
}
