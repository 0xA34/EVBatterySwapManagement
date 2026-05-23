package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.entity.Quanhuyen;

import java.util.List;

public interface IQuanhuyenService {
    List<Quanhuyen> findByTinhthanhId(Integer tinhthanhId);
}
