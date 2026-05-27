package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.response.StationCountByProvinceResponse;
import com.team4tech.evbatteryswap.entity.Tinhthanh;
import com.team4tech.evbatteryswap.repository.TinhthanhRepository;
import com.team4tech.evbatteryswap.service.interfaces.ITinhthanhService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TinhthanhService implements ITinhthanhService {

    private final TinhthanhRepository tinhthanhRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Tinhthanh> getTinhthanh() {
        return tinhthanhRepository.findAll();
    }


    @Override
    @Transactional(readOnly = true)
    public List<StationCountByProvinceResponse> countStationsByProvince() {
        return tinhthanhRepository.countStationsByProvince();
    }

}
