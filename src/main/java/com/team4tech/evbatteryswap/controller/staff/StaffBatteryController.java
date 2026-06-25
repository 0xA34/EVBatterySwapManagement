package com.team4tech.evbatteryswap.controller.staff;

import com.team4tech.evbatteryswap.dto.request.BatteryRequest;
import com.team4tech.evbatteryswap.dto.response.BatteryDiagnosticsResponse;
import com.team4tech.evbatteryswap.dto.response.BatteryLogResponse;
import com.team4tech.evbatteryswap.dto.response.BatteryResponse;
import com.team4tech.evbatteryswap.dto.response.BatteryStatusCountResponse;
import com.team4tech.evbatteryswap.entity.Battery;
import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.security.JwtAuthenticationFilter;
import com.team4tech.evbatteryswap.security.JwtTokenProvider;
import com.team4tech.evbatteryswap.service.BatteryDiagnosticsService;
import com.team4tech.evbatteryswap.service.BatteryService;
import com.team4tech.evbatteryswap.service.BatterySwapService;
import com.team4tech.evbatteryswap.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/staff/batteries")
@Tag(name = "Staff - Battery Management", description = "CRUD operations for managing batteries (Staff only, scoped to assigned stations)")
@PreAuthorize("hasRole('STAFF')")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class StaffBatteryController {

    BatteryService batteryService;
    BatteryDiagnosticsService diagnosticsService;
    BatterySwapService batterySwapService;
    UserService userService;
    JwtAuthenticationFilter jwtAuthenticationFilter;
    JwtTokenProvider jwtTokenProvider;

    @Operation(summary = "Liệt kê pin thuộc một station cụ thể của staff")
    @GetMapping("/page")
    public ResponseEntity<?> listBatteries(
            HttpServletRequest request,
            @RequestParam int stationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String chargeRange
    ) {
        List<Integer> stationIds = getStaffStationIds(request);
        if (!stationIds.contains(stationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Bạn không có quyền xem pin ở trạm này."));
        }

        java.math.BigDecimal minCharge = null;
        java.math.BigDecimal maxCharge = null;
        if (chargeRange != null && chargeRange.contains("-")) {
            try {
                String[] parts = chargeRange.split("-");
                minCharge = new java.math.BigDecimal(parts[0].trim());
                maxCharge = new java.math.BigDecimal(parts[1].trim());
            } catch (Exception e) {
            }
        }

        Page<BatteryResponse> result = batteryService
                .findBatteries(status, stationId, null, keyword, minCharge, maxCharge,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(BatteryResponse::from);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Xem chi tiết pin theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<BatteryResponse> getBattery(
            HttpServletRequest request,
            @PathVariable int id
    ) {
        List<Integer> stationIds = getStaffStationIds(request);
        Battery battery = batteryService.findById(id).orElse(null);
        if (battery == null) {
            return ResponseEntity.notFound().build();
        }
        validateBatteryScope(battery, stationIds);
        return ResponseEntity.ok(BatteryResponse.from(battery));
    }

    @Operation(summary = "Tạo pin mới")
    @PostMapping
    public ResponseEntity<?> createBattery(
            HttpServletRequest request,
            @Valid @RequestBody BatteryRequest batteryRequest
    ) {
        List<Integer> stationIds = getStaffStationIds(request);
        if (batteryRequest.currentStationId() != null && !stationIds.contains(batteryRequest.currentStationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Bạn không có quyền tạo pin cho station này."));
        }
        try {
            Battery created = batteryService.createBattery(batteryRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(BatteryResponse.from(created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Cập nhật pin")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBattery(
            HttpServletRequest request,
            @PathVariable int id,
            @Valid @RequestBody BatteryRequest batteryRequest
    ) {
        List<Integer> stationIds = getStaffStationIds(request);
        Battery battery = batteryService.findById(id).orElse(null);
        if (battery == null) {
            return ResponseEntity.notFound().build();
        }
        validateBatteryScope(battery, stationIds);
        if (batteryRequest.currentStationId() != null && !stationIds.contains(batteryRequest.currentStationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Bạn không có quyền chuyển pin sang station này."));
        }
        try {
            Battery updated = batteryService.updateBattery(id, batteryRequest);
            return ResponseEntity.ok(BatteryResponse.from(updated));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Xóa pin")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBattery(
            HttpServletRequest request,
            @PathVariable int id
    ) {
        List<Integer> stationIds = getStaffStationIds(request);
        Battery battery = batteryService.findById(id).orElse(null);
        if (battery == null) {
            return ResponseEntity.notFound().build();
        }
        validateBatteryScope(battery, stationIds);
        try {
            batteryService.deleteBattery(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Xem chẩn đoán SoH (live)")
    @GetMapping("/{id}/diagnostics")
    public ResponseEntity<?> getDiagnostics(
            HttpServletRequest request,
            @PathVariable int id
    ) {
        List<Integer> stationIds = getStaffStationIds(request);
        Battery battery = batteryService.findById(id).orElse(null);
        if (battery == null) {
            return ResponseEntity.notFound().build();
        }
        validateBatteryScope(battery, stationIds);
        try {
            BatteryDiagnosticsResponse resp = diagnosticsService.getDiagnostics(id);
            return ResponseEntity.ok(resp);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Recalculate SoH và lưu log")
    @PostMapping("/{id}/recalculate-soh")
    public ResponseEntity<?> recalculateSoh(
            HttpServletRequest request,
            @PathVariable int id
    ) {
        List<Integer> stationIds = getStaffStationIds(request);
        Battery battery = batteryService.findById(id).orElse(null);
        if (battery == null) {
            return ResponseEntity.notFound().build();
        }
        validateBatteryScope(battery, stationIds);
        try {
            BatteryDiagnosticsResponse resp = diagnosticsService.recalculate(id, "MANUAL");
            return ResponseEntity.ok(resp);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Xác nhận pin sạc đầy")
    @PostMapping("/{id}/charge-complete")
    public ResponseEntity<?> markChargeComplete(
            HttpServletRequest request,
            @PathVariable int id
    ) {
        List<Integer> stationIds = getStaffStationIds(request);
        Battery battery = batteryService.findById(id).orElse(null);
        if (battery == null) {
            return ResponseEntity.notFound().build();
        }
        validateBatteryScope(battery, stationIds);
        try {
            BatteryDiagnosticsResponse resp = batterySwapService.markFullyCharged(id);
            return ResponseEntity.ok(resp);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Lịch sử SoH của một pin")
    @GetMapping("/{id}/logs")
    public ResponseEntity<?> getBatteryLogs(
            HttpServletRequest request,
            @PathVariable int id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Integer> stationIds = getStaffStationIds(request);
        Battery battery = batteryService.findById(id).orElse(null);
        if (battery == null) {
            return ResponseEntity.notFound().build();
        }
        validateBatteryScope(battery, stationIds);
        try {
            Page<BatteryLogResponse> result = diagnosticsService
                    .getHistory(id, PageRequest.of(page, size))
                    .map(BatteryLogResponse::from);
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private List<Integer> getStaffStationIds(HttpServletRequest request) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        Integer userId = userService.findByUsername(username).get().getId();
        return userService.findStationsByUserId(userId)
                .stream().map(Station::getId).toList();
    }

    private void validateBatteryScope(Battery battery, List<Integer> stationIds) {
        if (battery.getCurrentStation() == null ||
                !stationIds.contains(battery.getCurrentStation().getId())) {
            throw new AccessDeniedException("Bạn không có quyền thao tác trên pin này.");
        }
    }

    @GetMapping("/countStatus")
    public ResponseEntity<?> countBatteryStatuses(
            HttpServletRequest request,
            @RequestParam Integer stationId
    ) {
        List<Integer> stationIds = getStaffStationIds(request);
        if (!stationIds.contains(stationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Bạn không có quyền xem dữ liệu ở trạm này."));
        }

        List<BatteryStatusCountResponse> result = batteryService.countBatteryStatuses(List.of(stationId));
        return ResponseEntity.ok(result);
    }


}