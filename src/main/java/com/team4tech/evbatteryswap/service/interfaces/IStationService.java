package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.entity.Station;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

public interface IStationService {

    Page<Station> findAll(Pageable pageable);
    Page<Station> findStations(
            @Param("status") String status,
            @Param("quan") Integer quan,
            @Param("province") Integer province,
            @Param("phuongxa") Integer phuongxa,
            Pageable pageable
    );
}
