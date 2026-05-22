package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.dto.request.StationRequest;
import com.team4tech.evbatteryswap.entity.Station;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface IStationService {

    Page<Station> findAll(Pageable pageable);

    Page<Station> findStations(
            @Param("status") String status,
            @Param("quan") Integer quan,
            @Param("province") Integer province,
            @Param("phuongxa") Integer phuongxa,
            Pageable pageable
    );

    Optional<Station> findById(int id);

    Station createStation(StationRequest request);

    Station updateStation(int id, StationRequest request);

    void deleteStation(int id);
}
