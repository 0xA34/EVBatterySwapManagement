package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.repository.StationRepository;
import com.team4tech.evbatteryswap.service.interfaces.IStationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StationService implements IStationService {

    private final StationRepository stationRepository;

    @Override
    public Page<Station> findAll(Pageable pageable) {
        return stationRepository.findAll(pageable);
    }

    @Override
    public Page<Station> findStations(
            @Param("status") String status,
            @Param("quan") Integer quan,
            @Param("province") Integer province,
            @Param("phuongxa") Integer phuongxa,
            Pageable pageable
    ) {
        return stationRepository.findStations(status, quan, province, phuongxa, pageable);
    }

}
