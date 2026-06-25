package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.dto.request.StationRequest;
import com.team4tech.evbatteryswap.dto.response.StationCountByProvinceResponse;
import com.team4tech.evbatteryswap.dto.response.StationHomeResponse;
import com.team4tech.evbatteryswap.dto.response.StationStatusCountResponse;
import com.team4tech.evbatteryswap.entity.Station;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IStationService {

    Page<Station> findAll(Pageable pageable);

    Page<StationHomeResponse> findStationsWithKeywordHome(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("quan") Integer quan,
            @Param("province") Integer province,
            @Param("phuongxa") Integer phuongxa,
            Pageable pageable
    );



    Page<Station> findStationsWithKeyword(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("quan") Integer quan,
            @Param("province") Integer province,
            @Param("phuongxa") Integer phuongxa,
            Pageable pageable
    );



    Optional<Station> findById(int id);

    Station createStation(StationRequest request);

    Station updateStation(int id, StationRequest request);

    Station updateStationStatus(int id, String status);

    void deleteStation(int id);

    List<StationStatusCountResponse> countStationsByStatus();


}
