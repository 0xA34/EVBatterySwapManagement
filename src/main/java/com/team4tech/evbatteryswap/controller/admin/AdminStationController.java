package com.team4tech.evbatteryswap.controller.admin;

import com.team4tech.evbatteryswap.dto.request.StationRequest;
import com.team4tech.evbatteryswap.dto.response.StationResponse;
import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.service.StationService;
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

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/stations")
@Tag(name = "Admin - Station Management", description = "CRUD operations for managing swap stations (Admin only)")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStationController {

    private final StationService stationService;

    @Operation(
        summary = "Liệt kê tất cả trạm",
        description = "Trả về danh sách trạm đổi pin được phân trang. Hỗ trợ lọc theo trạng thái, quận/huyện, tỉnh/thành và phường/xã."
    )
    @GetMapping
    public ResponseEntity<Page<StationResponse>> listStations(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false)    String status,
            @RequestParam(required = false)    Integer quan,
            @RequestParam(required = false)    Integer province,
            @RequestParam(required = false)    Integer phuongxa
    ) {
        Page<StationResponse> result = stationService
                .findStations(status, quan, province, phuongxa,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(StationResponse::from);
        return ResponseEntity.ok(result);
    }

    @Operation(
        summary = "Tìm trạm theo ID",
        description = "Trả về thông tin của một trạm đổi pin dựa trên ID. Trả về mã lỗi 404 nếu trạm không tồn tại."
    )
    @GetMapping("/{id}")
    public ResponseEntity<StationResponse> getStation(@PathVariable int id) {
        return stationService.findById(id)
                .map(StationResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Tìm kiếm trạm theo từ khóa",
        description = "Tìm kiếm trạm đổi pin theo từ khóa (tên hoặc địa chỉ). Hỗ trợ phân trang."
    )
    @GetMapping("/search")
    public ResponseEntity<Page<StationResponse>> searchStations(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<StationResponse> result = stationService
                .searchByKeyword(keyword, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(StationResponse::from);
        return ResponseEntity.ok(result);
    }

    @Operation(
        summary = "Tạo trạm mới",
        description = "Tạo một trạm đổi pin mới. Trả về mã 400 nếu dữ liệu không hợp lệ."
    )
    @PostMapping
    public ResponseEntity<?> createStation(@Valid @RequestBody StationRequest request) {
        try {
            Station created = stationService.createStation(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(StationResponse.from(created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
        summary = "Cập nhật trạm đang tồn tại",
        description = "Cập nhật thông tin trạm đổi pin theo ID. Trả về mã lỗi 404 nếu trạm không tồn tại, hoặc 400 nếu dữ liệu không hợp lệ."
    )
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStation(
            @PathVariable int id,
            @Valid @RequestBody StationRequest request
    ) {
        try {
            Station updated = stationService.updateStation(id, request);
            return ResponseEntity.ok(StationResponse.from(updated));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
        summary = "Xóa một trạm",
        description = "Xóa một trạm đổi pin bằng ID. Trả về 204 nếu thành công hoặc 404 nếu trạm không tồn tại."
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStation(@PathVariable int id) {
        try {
            stationService.deleteStation(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getStatus() {
        Map<String, String> statusMap = new LinkedHashMap<>();

        statusMap.put("ACTIVE", "Đang Hoạt Động");
        statusMap.put("MAINTENANCE", "Đang Bảo Trì");
        statusMap.put("DEPLOYING", "Đang Triển Khai");
        statusMap.put("INACTIVE", "Ngưng Hoạt Động");

        return ResponseEntity.ok(statusMap);
    }

}
