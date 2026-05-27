package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.response.DistrictStationCountResponse;
import com.team4tech.evbatteryswap.entity.Quanhuyen;
import com.team4tech.evbatteryswap.repository.QuanhuyenRepository;
import com.team4tech.evbatteryswap.service.interfaces.IQuanhuyenService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuanhuyenService implements IQuanhuyenService {
    private final QuanhuyenRepository quanhuyenRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Quanhuyen> findByTinhthanhId(Integer tinhthanhId) {
        return quanhuyenRepository.findByTinhthanhId(tinhthanhId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DistrictStationCountResponse> findDistrictCountsByProvinceId(@Param("tinhthanhId") Integer tinhthanhId) {
        return quanhuyenRepository.findDistrictCountsByProvinceId(tinhthanhId);
    }

}
