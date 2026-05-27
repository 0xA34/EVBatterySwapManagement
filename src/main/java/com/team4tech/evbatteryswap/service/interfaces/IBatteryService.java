package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.dto.request.BatteryRequest;
import com.team4tech.evbatteryswap.entity.Battery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface IBatteryService {

    Page<Battery> findAll(Pageable pageable);

    Page<Battery> findBatteries(String status, Integer stationId, Integer userId, Pageable pageable);

    Optional<Battery> findById(int id);

    Page<Battery> searchByKeyword(String keyword, Pageable pageable);

    Battery createBattery(BatteryRequest request);

    Battery updateBattery(int id, BatteryRequest request);

    void deleteBattery(int id);
}
