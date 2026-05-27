package com.team4tech.evbatteryswap.service;
import com.team4tech.evbatteryswap.dto.response.WardStationCountResponse;
import com.team4tech.evbatteryswap.entity.Phuongxa;
import com.team4tech.evbatteryswap.repository.PhuongxaRepository;
import com.team4tech.evbatteryswap.service.interfaces.IPhuongxaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhuongxaService implements IPhuongxaService {
    private final PhuongxaRepository phuongxaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Phuongxa> findByQuanhuyenId(Integer quanhuyenId) {
        return phuongxaRepository.findByQuanhuyenId(quanhuyenId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WardStationCountResponse> findWardCountsByDistrictId(@Param("quanhuyenId") Integer quanhuyenId) {
        return phuongxaRepository.findWardCountsByDistrictId(quanhuyenId);
    }

}
