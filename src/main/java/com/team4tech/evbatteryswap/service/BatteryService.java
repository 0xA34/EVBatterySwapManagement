package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.BatteryRequest;
import com.team4tech.evbatteryswap.entity.Battery;
import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.repository.BatteryRepository;
import com.team4tech.evbatteryswap.service.interfaces.IBatteryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BatteryService implements IBatteryService {

    private final BatteryRepository batteryRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<Battery> findAll(Pageable pageable) {
        return batteryRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Battery> findBatteries(String status, Integer stationId, Integer userId, Pageable pageable) {
        return batteryRepository.findBatteries(status, stationId, userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Battery> findById(int id) {
        return batteryRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Battery> searchByKeyword(String keyword, Pageable pageable) {
        return batteryRepository.searchByKeyword(keyword, pageable);
    }

    @Override
    @Transactional
    public Battery createBattery(BatteryRequest request) {
        if (batteryRepository.existsBySerialNumber(request.serialNumber())) {
            throw new IllegalArgumentException("Số serial '" + request.serialNumber() + "' đã tồn tại");
        }

        Battery battery = new Battery();
        mapRequestToBattery(battery, request);
        battery.setCreatedAt(Instant.now());
        battery.setUpdatedAt(Instant.now());

        return batteryRepository.save(battery);
    }

    @Override
    @Transactional
    public Battery updateBattery(int id, BatteryRequest request) {
        Battery battery = batteryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy pin với id: " + id));

        if (batteryRepository.existsBySerialNumberAndIdNot(request.serialNumber(), id)) {
            throw new IllegalArgumentException("Số serial '" + request.serialNumber() + "' đã được sử dụng bởi pin khác");
        }

        mapRequestToBattery(battery, request);
        battery.setUpdatedAt(Instant.now());

        return batteryRepository.save(battery);
    }

    @Override
    @Transactional
    public void deleteBattery(int id) {
        if (!batteryRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy pin với id: " + id);
        }
        batteryRepository.deleteById(id);
    }

    // Helper

    private void mapRequestToBattery(Battery battery, BatteryRequest request) {
        battery.setSerialNumber(request.serialNumber());
        battery.setModel(request.model());
        battery.setCapacityKwh(request.capacityKwh());

        if (request.currentChargePercentage() != null) {
            battery.setCurrentChargePercentage(request.currentChargePercentage());
        }
        if (request.healthPercentage() != null) {
            battery.setHealthPercentage(request.healthPercentage());
        }
        if (request.chargeCycles() != null) {
            battery.setChargeCycles(request.chargeCycles());
        }
        battery.setStatus(request.status());
        battery.setAmount(request.amount());
        battery.setManufactureDate(request.manufactureDate());

        if (request.currentStationId() != null) {
            Station station = new Station();
            station.setId(request.currentStationId());
            battery.setCurrentStation(station);
        } else {
            battery.setCurrentStation(null);
        }

        if (request.userId() != null) {
            User user = new User();
            user.setId(request.userId());
            battery.setUser(user);
        } else {
            battery.setUser(null);
        }
    }
}
