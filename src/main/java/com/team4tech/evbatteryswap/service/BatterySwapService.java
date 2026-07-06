package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.LinkBatteryRequest;
import com.team4tech.evbatteryswap.dto.request.RentRequest;
import com.team4tech.evbatteryswap.dto.request.SwapRequest;
import com.team4tech.evbatteryswap.dto.response.BatteryDiagnosticsResponse;
import com.team4tech.evbatteryswap.dto.response.BatteryResponse;
import com.team4tech.evbatteryswap.dto.response.SwapResponse;
import com.team4tech.evbatteryswap.entity.Battery;
import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.repository.BatteryRepository;
import com.team4tech.evbatteryswap.repository.StationRepository;
import com.team4tech.evbatteryswap.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

/**
 * Điều phối toàn bộ nghiệp vụ đổi pin (battery swap).
 *
 * <p><b>Luồng:</b>
 * <ol>
 *   <li>Tìm pin cũ của tài xế (status = IN_USE).</li>
 *   <li>Kiểm tra trạm tồn tại và đang ACTIVE.</li>
 *   <li>Tìm pin tốt nhất tại trạm (AVAILABLE, đủ charge, SoH cao nhất).</li>
 *   <li>Pin cũ: {@code chargeCycles += 1}, {@code status = CHARGING},
 *       {@code user = null}, {@code currentStation = trạm}.</li>
 *   <li>Gọi {@link BatteryDiagnosticsService#recalculate(int, String)} với trigger {@code "ON_SWAP"}
 *       → cập nhật {@code healthPercentage} + ghi {@link com.team4tech.evbatteryswap.entity.BatteryLog}.</li>
 *   <li>Pin mới: {@code status = IN_USE}, {@code user = tài xế},
 *       {@code currentStation = null}.</li>
 * </ol>
 *
 * <p>Toàn bộ là một transaction — lỗi ở bất kỳ bước nào đều rollback.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BatterySwapService {

    private final BatteryRepository        batteryRepository;
    private final StationRepository        stationRepository;
    private final UserRepository           userRepository;
    private final BatteryDiagnosticsService diagnosticsService;


    /**
     * Thực hiện đổi pin cho tài xế.
     *
     * @param username  username của tài xế (lấy từ JWT).
     * @param request   thông tin yêu cầu đổi pin.
     * @return {@link SwapResponse} chứa đầy đủ thông tin sau swap.
     * @throws EntityNotFoundException  nếu tài xế / trạm / pin không tồn tại.
     * @throws IllegalStateException    nếu vi phạm quy tắc nghiệp vụ.
     */
    @Transactional
    public SwapResponse swap(String username, SwapRequest request) {

        // 1. Xác định tài xế
        User driver = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy tài xế: " + username));

        // 2. Tìm pin cũ của tài xế (phải đang IN_USE)
        Battery oldBattery = batteryRepository.findCurrentBatteryOfUser(driver.getId())
                .orElseThrow(() -> new IllegalStateException(
                        "Tài xế chưa có pin IN_USE — không thể đổi."));

        // 3. Kiểm tra trạm
        Station station = stationRepository.findById(request.stationId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy trạm với id: " + request.stationId()));

        if (!"ACTIVE".equalsIgnoreCase(station.getStatus())) {
            throw new IllegalStateException(
                    "Trạm [" + station.getName() + "] không ở trạng thái ACTIVE — không thể đổi pin.");
        }

        // 4. Tìm pin tốt nhất tại trạm (top-1 theo healthPercentage DESC) hoặc theo ID chỉ định
        Battery newBattery;
        if (request.batteryId() != null) {
            newBattery = batteryRepository.findById(request.batteryId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy pin với id: " + request.batteryId()));
            
            if (!"AVAILABLE".equalsIgnoreCase(newBattery.getStatus())) {
                throw new IllegalStateException("Pin #" + request.batteryId() + " không ở trạng thái AVAILABLE.");
            }
            if (newBattery.getCurrentStation() == null || !newBattery.getCurrentStation().getId().equals(station.getId())) {
                throw new IllegalStateException("Pin #" + request.batteryId() + " không ở trạm [" + station.getName() + "].");
            }
            if (newBattery.getCurrentChargePercentage().compareTo(request.effectiveMinCharge()) < 0) {
                throw new IllegalStateException("Pin #" + request.batteryId() + " không đủ charge (hiện tại: " + newBattery.getCurrentChargePercentage() + "%, yêu cầu: " + request.effectiveMinCharge() + "%).");
            }
        } else {
            newBattery = batteryRepository
                    .findBestAvailableAtStation(station.getId(), request.effectiveMinCharge(),
                            PageRequest.of(0, 1))
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException(
                            "Không có pin AVAILABLE đủ điều kiện tại trạm ["
                            + station.getName() + "]. "
                            + "Yêu cầu charge >= " + request.effectiveMinCharge() + "%."));
        }

        // Không cho đổi pin sang chính cái pin đang dùng (edge case)
        if (oldBattery.getId().equals(newBattery.getId())) {
            throw new IllegalStateException("Pin tốt nhất tại trạm trùng với pin hiện tại — không thể đổi.");
        }

        log.info("[Swap] Tài xế '{}' (id={}) đổi pin #{} → pin #{} tại trạm '{}' (id={})",
                username, driver.getId(),
                oldBattery.getId(), newBattery.getId(),
                station.getName(), station.getId());

        // 5. Xử lý pin cũ: đưa về trạng thái CHARGING, trả về trạm (không cộng cycle ở đây nữa)
        oldBattery.setStatus("CHARGING");
        oldBattery.setUser(null);
        oldBattery.setCurrentStation(station);
        batteryRepository.save(oldBattery);

        // 6. Tính lại SoH cho pin cũ ngay lúc trả — trigger = ON_SWAP, ghi BatteryLog
        BatteryDiagnosticsResponse oldSoh =
                diagnosticsService.recalculate(oldBattery.getId(), "ON_SWAP");

        // 7. Xử lý pin mới: gán cho tài xế, đổi sang IN_USE, rời khỏi trạm
        newBattery.setStatus("IN_USE");
        newBattery.setUser(driver);
        newBattery.setCurrentStation(null);
        batteryRepository.save(newBattery);

        log.info("[Swap] Hoàn thành — pin cũ #{} SoH={} Grade={} | pin mới #{} charge={}%",
                oldBattery.getId(), oldSoh.soh(), oldSoh.healthGrade(),
                newBattery.getId(), newBattery.getCurrentChargePercentage());

        return new SwapResponse(
                BatteryResponse.from(oldBattery),
                oldSoh,
                BatteryResponse.from(newBattery),
                Instant.now(),
                String.format("Đổi pin thành công. Pin mới #%d (charge=%.1f%%, SoH=%.1f%%).",
                        newBattery.getId(),
                        newBattery.getCurrentChargePercentage().doubleValue(),
                        newBattery.getHealthPercentage().doubleValue())
        );
    }

    /**
     * Lấy thông tin pin hiện tại của tài xế.
     *
     * @param username username của tài xế (lấy từ JWT).
     * @return pin đang IN_USE.
     * @throws EntityNotFoundException nếu không tìm thấy tài xế.
     * @throws IllegalStateException   nếu tài xế chưa có pin.
     */
    @Transactional(readOnly = true)
    public Battery getCurrentBattery(String username) {
        User driver = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy tài xế: " + username));

        return batteryRepository.findCurrentBatteryOfUser(driver.getId())
                .orElseThrow(() -> new IllegalStateException(
                        "Tài xế hiện chưa được gán pin nào."));
    }

    /**
     * Tài xế mới thuê pin lần đầu (chưa có pin IN_USE).
     */
    @Transactional
    public BatteryResponse rent(String username, RentRequest request) {
        User driver = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy tài xế: " + username));

        // Kiểm tra xem đã có pin chưa
        Optional<Battery> existingBattery = batteryRepository.findCurrentBatteryOfUser(driver.getId());
        if (existingBattery.isPresent()) {
            throw new IllegalStateException("Tài xế đã có pin đang sử dụng. Vui lòng dùng tính năng Đổi pin (Swap).");
        }

        Station station = stationRepository.findById(request.stationId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy trạm với id: " + request.stationId()));

        if (!"ACTIVE".equalsIgnoreCase(station.getStatus())) {
            throw new IllegalStateException("Trạm [" + station.getName() + "] không ACTIVE.");
        }

        // Tìm pin tốt nhất hoặc theo ID
        Battery newBattery;
        if (request.batteryId() != null) {
            newBattery = batteryRepository.findById(request.batteryId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy pin với id: " + request.batteryId()));
            
            if (!"AVAILABLE".equalsIgnoreCase(newBattery.getStatus())) {
                throw new IllegalStateException("Pin #" + request.batteryId() + " không ở trạng thái AVAILABLE.");
            }
            if (newBattery.getCurrentStation() == null || !newBattery.getCurrentStation().getId().equals(station.getId())) {
                throw new IllegalStateException("Pin #" + request.batteryId() + " không ở trạm [" + station.getName() + "].");
            }
            if (newBattery.getCurrentChargePercentage().compareTo(request.effectiveMinCharge()) < 0) {
                throw new IllegalStateException("Pin #" + request.batteryId() + " không đủ charge (hiện tại: " + newBattery.getCurrentChargePercentage() + "%, yêu cầu: " + request.effectiveMinCharge() + "%).");
            }
        } else {
            newBattery = batteryRepository
                    .findBestAvailableAtStation(station.getId(), request.effectiveMinCharge(), PageRequest.of(0, 1))
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException(
                            "Không có pin AVAILABLE đủ điều kiện tại trạm. Yêu cầu charge >= " + request.effectiveMinCharge() + "%."));
        }

        log.info("[Rent] Tài xế '{}' (id={}) THUÊ pin #{} tại trạm '{}'",
                username, driver.getId(), newBattery.getId(), station.getName());

        newBattery.setStatus("IN_USE");
        newBattery.setUser(driver);
        newBattery.setCurrentStation(null);
        batteryRepository.save(newBattery);

        // Tính lại SoH (ON_RENT)
        diagnosticsService.recalculate(newBattery.getId(), "ON_RENT");

        return BatteryResponse.from(newBattery);
    }

    @Transactional
    public BatteryResponse linkBattery(String username, LinkBatteryRequest request) {

        User driver = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy tài xế: " + username));

        Optional<Battery> existingBattery = batteryRepository.findCurrentBatteryOfUser(driver.getId());
        if (existingBattery.isPresent()) {
            throw new IllegalStateException(
                    "Tài xế đã liên kết pin (serial: "
                    + existingBattery.get().getSerialNumber()
                    + "). Mỗi tài xế chỉ được liên kết 1 pin.");
        }

        if (batteryRepository.existsBySerialNumber(request.serialNumber())) {
            throw new IllegalStateException(
                    "Số serial '" + request.serialNumber() + "' đã tồn tại trong hệ thống.");
        }

        Battery battery = new Battery();
        battery.setSerialNumber(request.serialNumber());
        battery.setModel(request.model());
        battery.setCapacityKwh(request.effectiveCapacityKwh());
        battery.setCurrentChargePercentage(request.effectiveChargePercentage());
        battery.setHealthPercentage(new java.math.BigDecimal("100.00"));
        battery.setChargeCycles(0);
        battery.setStatus("IN_USE");
        battery.setUser(driver);
        battery.setCurrentStation(null);   // null
        battery.setCreatedAt(Instant.now());
        battery.setUpdatedAt(Instant.now());

        batteryRepository.save(battery);

        log.info("[LinkBattery] Tài xế '{}' (id={}) liên kết pin mới serial='{}' → Battery#{}",
                username, driver.getId(), battery.getSerialNumber(), battery.getId());

        return BatteryResponse.from(battery);
    }

    /**
     * Staff/Admin xác nhận pin đã sạc đầy.
     */
    @Transactional
    public BatteryDiagnosticsResponse markFullyCharged(int batteryId) {
        Battery battery = batteryRepository.findById(batteryId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy pin id=" + batteryId));

        if (!"CHARGING".equalsIgnoreCase(battery.getStatus())) {
            throw new IllegalStateException("Pin không ở trạng thái CHARGING (hiện tại: " + battery.getStatus() + ").");
        }

        // Cập nhật chargeCycles và status
        battery.setChargeCycles((battery.getChargeCycles() != null ? battery.getChargeCycles() : 0) + 1);
        battery.setStatus("AVAILABLE");
        battery.setCurrentChargePercentage(new java.math.BigDecimal("100.00")); // giả định sạc đầy
        batteryRepository.save(battery);

        log.info("[ChargeComplete] Pin #{} sạc đầy -> AVAILABLE", batteryId);

        // Tính lại SoH (ON_CHARGE_COMPLETE)
        return diagnosticsService.recalculate(battery.getId(), "ON_CHARGE_COMPLETE");
    }
}
