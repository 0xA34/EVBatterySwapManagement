package com.team4tech.evbatteryswap.controller.admin;

import com.team4tech.evbatteryswap.dto.request.BatteryRequest;
import com.team4tech.evbatteryswap.dto.response.BatteryDiagnosticsResponse;
import com.team4tech.evbatteryswap.dto.response.BatteryLogResponse;
import com.team4tech.evbatteryswap.dto.response.BatteryResponse;
import com.team4tech.evbatteryswap.entity.Battery;
import com.team4tech.evbatteryswap.dto.response.BatteryDiagnosticsResponse;
import com.team4tech.evbatteryswap.dto.response.BatteryLogResponse;
import com.team4tech.evbatteryswap.dto.response.BatteryResponse;
import com.team4tech.evbatteryswap.entity.Battery;
import com.team4tech.evbatteryswap.service.BatteryDiagnosticsService;
import com.team4tech.evbatteryswap.service.BatteryService;
import com.team4tech.evbatteryswap.service.BatterySwapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/batteries")
@Tag(name = "Admin - Battery Management", description = "CRUD operations for managing batteries (Admin only)")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBatteryController {

    private final BatteryService            batteryService;
    private final BatteryDiagnosticsService diagnosticsService;
    private final BatterySwapService        batterySwapService;

    @Operation(
        summary = "Liệt kê tất cả pin",
        description = "Trả về danh sách pin được phân trang. Hỗ trợ lọc theo trạng thái, ID trạm, ID người dùng, từ khóa, và khoảng phần trăm sạc (ví dụ: 10-30, 30-50)."
    )
    @GetMapping
    public ResponseEntity<Page<BatteryResponse>> listBatteries(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false)    String status,
            @RequestParam(required = false)    Integer stationId,
            @RequestParam(required = false)    Integer userId,
            @RequestParam(required = false)    String keyword,
            @RequestParam(required = false)    String chargeRange
    ) {
        java.math.BigDecimal minCharge = null;
        java.math.BigDecimal maxCharge = null;
        if (chargeRange != null && chargeRange.contains("-")) {
            try {
                String[] parts = chargeRange.split("-");
                minCharge = new java.math.BigDecimal(parts[0].trim());
                maxCharge = new java.math.BigDecimal(parts[1].trim());
            } catch (Exception e) {
                // Ignore parse errors, effectively no filter
            }
        }

        Page<BatteryResponse> result = batteryService
                .findBatteries(status, stationId, userId, keyword, minCharge, maxCharge,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(BatteryResponse::from);
        return ResponseEntity.ok(result);
    }

    @Operation(
        summary = "Tìm pin theo ID",
        description = "Trả về thông tin chi tiết của một viên pin dựa trên ID. Trả về 404 nếu không tìm thấy."
    )
    @GetMapping("/{id}")
    public ResponseEntity<BatteryResponse> getBattery(@PathVariable int id) {
        return batteryService.findById(id)
                .map(BatteryResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Tạo pin mới",
        description = "Tạo một viên pin mới vào hệ thống. Trả về 400 nếu số serial đã tồn tại hoặc dữ liệu không hợp lệ."
    )
    @PostMapping
    public ResponseEntity<?> createBattery(@Valid @RequestBody BatteryRequest request) {
        try {
            Battery created = batteryService.createBattery(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(BatteryResponse.from(created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
        summary = "Cập nhật pin",
        description = "Cập nhật thông tin viên pin theo ID. Trả về 404 nếu không tìm thấy, hoặc 400 nếu dữ liệu không hợp lệ."
    )
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBattery(
            @PathVariable int id,
            @Valid @RequestBody BatteryRequest request
    ) {
        try {
            Battery updated = batteryService.updateBattery(id, request);
            return ResponseEntity.ok(BatteryResponse.from(updated));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
        summary = "Xóa pin",
        description = "Xóa một viên pin khỏi hệ thống theo ID. Trả về 204 nếu thành công hoặc 404 nếu không tồn tại."
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBattery(@PathVariable int id) {
        try {
            batteryService.deleteBattery(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @Operation(
        summary = "Xem chẩn đoán SoH (live)",
        description = "Tính toán SoH và các thông số sức khỏe pin theo thời gian thực. "
                    + "KHÔNG ghi vào DB, không tạo log. Dùng để xem nhanh."
    )
    @GetMapping("/{id}/diagnostics")
    public ResponseEntity<?> getDiagnostics(@PathVariable int id) {
        try {
            BatteryDiagnosticsResponse resp = diagnosticsService.getDiagnostics(id);
            return ResponseEntity.ok(resp);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
        summary = "Recalculate SoH và lưu log",
        description = "Tính lại SoH, cập nhật Battery.healthPercentage và ghi một BatteryLog mới. "
                    + "Dùng khi admin muốn cưỡng bức cập nhật SoH ngay lập tức."
    )
    @PostMapping("/{id}/recalculate-soh")
    public ResponseEntity<?> recalculateSoh(@PathVariable int id) {
        try {
            BatteryDiagnosticsResponse resp = diagnosticsService.recalculate(id, "MANUAL");
            return ResponseEntity.ok(resp);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
        summary = "Xác nhận pin sạc đầy",
        description = "Staff/Admin dùng API này để xác nhận pin đang sạc (CHARGING) đã đầy. "
                    + "Sẽ tự động cập nhật status = AVAILABLE, chargeCycles + 1, "
                    + "tính lại SoH (ON_CHARGE_COMPLETE) và ghi log."
    )
    @PostMapping("/{id}/charge-complete")
    public ResponseEntity<?> markChargeComplete(@PathVariable int id) {
        try {
            BatteryDiagnosticsResponse resp = batterySwapService.markFullyCharged(id);
            return ResponseEntity.ok(resp);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
        summary = "Lịch sử SoH của một pin",
        description = "Trả về danh sách các lần tính SoH của pin, sắp xếp từ mới nhất đến cũ nhất. Hỗ trợ phân trang."
    )
    @GetMapping("/{id}/logs")
    public ResponseEntity<?> getBatteryLogs(
            @PathVariable int id,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            Page<BatteryLogResponse> result = diagnosticsService
                    .getHistory(id, PageRequest.of(page, size))
                    .map(BatteryLogResponse::from);
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
