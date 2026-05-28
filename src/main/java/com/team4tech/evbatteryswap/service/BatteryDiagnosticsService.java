package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.response.BatteryDiagnosticsResponse;
import com.team4tech.evbatteryswap.entity.Battery;
import com.team4tech.evbatteryswap.entity.BatteryLog;
import com.team4tech.evbatteryswap.repository.BatteryLogRepository;
import com.team4tech.evbatteryswap.repository.BatteryRepository;
import com.team4tech.evbatteryswap.service.soh.SohCalculationEngine;
import com.team4tech.evbatteryswap.service.soh.SohResult;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Orchestrator cho việc tính toán và lưu trữ SoH.
 *
 * <ul>
 *   <li>{@link #getDiagnostics(int)} — tính live, không ghi DB.</li>
 *   <li>{@link #recalculate(int, String)} — tính + ghi {@link BatteryLog} + cập nhật
 *       {@code Battery.healthPercentage}.</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BatteryDiagnosticsService {

    private final BatteryRepository        batteryRepository;
    private final BatteryLogRepository     batteryLogRepository;
    private final SohCalculationEngine     engine;

    /**
     * Trả về chẩn đoán đầy đủ — KHÔNG ghi vào DB.
     * Dùng khi admin chỉ muốn xem nhanh mà không muốn tạo log.
     */
    @Transactional(readOnly = true)
    public BatteryDiagnosticsResponse getDiagnostics(int batteryId) {
        Battery battery = findOrThrow(batteryId);
        SohResult result = engine.calculate(battery);
        return BatteryDiagnosticsResponse.from(battery, result);
    }

    /**
     * Tính SoH, lưu {@link BatteryLog}, cập nhật {@code Battery.healthPercentage}.
     *
     * @param batteryId     ID của pin.
     * @param triggerSource nguồn kích hoạt (MANUAL, SCHEDULED, ON_SWAP…).
     * @return Kết quả chẩn đoán đầy đủ.
     */
    @Transactional
    public BatteryDiagnosticsResponse recalculate(int batteryId, String triggerSource) {
        Battery   battery = findOrThrow(batteryId);
        SohResult result  = engine.calculate(battery);

        // Cập nhật healthPercentage trên Battery
        battery.setHealthPercentage(result.soh());
        batteryRepository.save(battery);

        // Lưu snapshot vào BatteryLog
        BatteryLog batteryLog = buildLog(battery, result, triggerSource);
        batteryLogRepository.save(batteryLog);

        log.info("[SoH] Battery#{} → SoH={} | Grade={} | RUL={} cycles | trigger={}",
                batteryId, result.soh(), result.healthGrade(), result.rulCycles(), triggerSource);

        return BatteryDiagnosticsResponse.from(battery, result);
    }


    /**
     * Trả về lịch sử SoH của một pin (phân trang).
     */
    @Transactional(readOnly = true)
    public Page<BatteryLog> getHistory(int batteryId, Pageable pageable) {
        if (!batteryRepository.existsById(batteryId)) {
            throw new EntityNotFoundException("Không tìm thấy pin với id: " + batteryId);
        }
        return batteryLogRepository.findByBatteryIdOrderByCalculatedAtDesc(batteryId, pageable);
    }

    private Battery findOrThrow(int batteryId) {
        return batteryRepository.findById(batteryId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy pin với id: " + batteryId));
    }

    private BatteryLog buildLog(Battery battery, SohResult result, String triggerSource) {
        BatteryLog log = new BatteryLog();
        log.setBattery(battery);
        log.setSoh(result.soh());
        log.setSohCycle(result.sohCycle());
        log.setSohAge(result.sohAge());
        log.setSoc(battery.getCurrentChargePercentage());
        log.setChargeCycles(battery.getChargeCycles() != null ? battery.getChargeCycles() : 0);
        log.setHealthGrade(result.healthGrade());
        log.setRulCycles(result.rulCycles());
        log.setDegradationRatePer100Cycles(result.degradationRatePer100Cycles());
        log.setTriggerSource(triggerSource != null ? triggerSource : "SYSTEM");
        log.setCalculatedAt(Instant.now());
        return log;
    }
}
