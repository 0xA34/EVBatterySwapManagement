package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.SwapRequest;
import com.team4tech.evbatteryswap.entity.Battery;
import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.repository.BatteryRepository;
import com.team4tech.evbatteryswap.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BatterySimulationScheduler {

    private final BatteryRepository batteryRepository;
    private final BatterySwapService batterySwapService;
    private final StationRepository stationRepository;

    @Value("${simulation.enabled:true}")
    private boolean simulationEnabled;

    @Value("${simulation.discharge.rate:30}")
    private double dischargeRate;

    @Value("${simulation.charge.rate:35}")
    private double chargeRate;

    @Scheduled(fixedRateString = "${simulation.interval:30000}")
    public void runSimulation() {
        if (!simulationEnabled) {
            return;
        }
        log.info("[Simulation] Bắt đầu mô phỏng thời gian thực...");

        simulateDischarge();
        simulateCharge();

        log.info("[Simulation] Kết thúc chu kỳ mô phỏng.");
    }

    private void simulateDischarge() {
        List<Battery> inUseBatteries = batteryRepository.findByStatusWithUser("IN_USE");
        for (Battery battery : inUseBatteries) {
            if (battery.getUser() == null) continue;

            BigDecimal newCharge = battery.getCurrentChargePercentage().subtract(new BigDecimal(dischargeRate));
            
            if (newCharge.compareTo(new BigDecimal("15.00")) <= 0) {
                // Pin yếu, ép tài xế đi đổi pin
                log.info("[Simulation] Pin #{} của tài xế '{}' đã cạn ({}%), tự động đi đổi pin...", 
                        battery.getId(), battery.getUser().getUsername(), newCharge);
                
                // Lấy trạm đang ACTIVE bất kỳ
                List<Station> activeStations = stationRepository.findAll().stream()
                        .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                        .toList();
                
                if (activeStations.isEmpty()) {
                    log.warn("[Simulation] Không có trạm ACTIVE nào để tài xế '{}' đổi pin!", battery.getUser().getUsername());
                    continue;
                }
                
                // Chọn ngẫu nhiên hoặc trạm đầu tiên
                Station station = activeStations.get(0);
                
                try {
                    // Yêu cầu đổi pin, minCharge mặc định 80%
                    SwapRequest request = new SwapRequest(station.getId(), new BigDecimal("80.00"), null);
                    batterySwapService.swap(battery.getUser().getUsername(), request);
                } catch (Exception e) {
                    log.error("[Simulation] Tài xế '{}' đổi pin thất bại: {}", battery.getUser().getUsername(), e.getMessage());
                }
                
            } else {
                // Cập nhật % pin mới
                battery.setCurrentChargePercentage(newCharge);
                batteryRepository.save(battery);
                log.info("[Simulation] Pin #{} đang dùng tụt xuống {}%", battery.getId(), newCharge);
            }
        }
    }

    private void simulateCharge() {
        List<Battery> chargingBatteries = batteryRepository.findByStatus("CHARGING");
        for (Battery battery : chargingBatteries) {
            BigDecimal newCharge = battery.getCurrentChargePercentage().add(new BigDecimal(chargeRate));
            
            if (newCharge.compareTo(new BigDecimal("100.00")) >= 0) {
                log.info("[Simulation] Pin #{} đã sạc đầy (100%), tự động hoàn tất sạc...", battery.getId());
                try {
                    batterySwapService.markFullyCharged(battery.getId());
                } catch (Exception e) {
                    log.error("[Simulation] Lỗi khi hoàn tất sạc cho pin #{}: {}", battery.getId(), e.getMessage());
                }
            } else {
                battery.setCurrentChargePercentage(newCharge);
                batteryRepository.save(battery);
                log.info("[Simulation] Pin #{} đang sạc... được {}%", battery.getId(), newCharge);
            }
        }
    }
}
