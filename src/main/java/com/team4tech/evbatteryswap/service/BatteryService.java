package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.BatteryRequest;
import com.team4tech.evbatteryswap.dto.response.BatteryStatusCountResponse;
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
import java.util.*;
import java.util.stream.Collectors;

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
    public Page<Battery> findBatteries(String status, Integer stationId, Integer userId, String keyword, java.math.BigDecimal minCharge, java.math.BigDecimal maxCharge, Pageable pageable) {
        String keywordFilter = (keyword == null || keyword.trim().isEmpty()) ? null : "%" + keyword.trim().toLowerCase() + "%";
        return batteryRepository.findBatteries(status, stationId, userId, keywordFilter, minCharge, maxCharge, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Battery> findById(int id) {
        return batteryRepository.findById(id);
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

    @Override
    @Transactional(readOnly = true)
    public Page<Battery> findBatteriesByStationIds(int stationIds, String status, Pageable pageable) {
        return batteryRepository.findBatteriesByStationId(stationIds, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatteryStatusCountResponse> countBatteryStatuses(List<Integer> stationIds) {

        List<Object[]> dbResults = batteryRepository.countBatteryStatusesByStationIds(stationIds);

        Map<String, Long> dbResultMap = dbResults.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[1], // Vị trí 1 là status
                        row -> (Long) row[2],   // Vị trí 2 là count
                        Long::sum               // Cộng dồn số lượng nếu có nhiều trạm cùng trả về 1 trạng thái
                ));

        List<String> allStatuses = Arrays.asList(
                "AVAILABLE", "EMPTY", "RESERVED", "RENTED", "CHARGING"
        );

        List<BatteryStatusCountResponse> finalResults = new ArrayList<>();

        for (String status : allStatuses) {
            long count = dbResultMap.getOrDefault(status, 0L);
            finalResults.add(new BatteryStatusCountResponse(status, count));
        }

        return finalResults;
    }


}
