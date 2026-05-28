package com.team4tech.evbatteryswap.controller.admin;


import com.team4tech.evbatteryswap.dto.request.CreateStaffRequest;
import com.team4tech.evbatteryswap.dto.request.StaffStationRequest;
import com.team4tech.evbatteryswap.dto.request.UserOnChangeRequest;
import com.team4tech.evbatteryswap.dto.response.StaffResponse;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.service.StaffService;
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

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/staffs")
@Tag(name = "Admin - Staff Management", description = "CRUD operations for managing staffs (Admin only)")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminStaffController {
    private final StaffService staffService;

    @Operation(
            summary = "Liệt kê danh sách Staff",
            description = "Trả về danh sách Staff được phân trang. Hỗ trợ tìm kiếm theo keyword (username, fullName, email) và lọc theo status."
    )
    @GetMapping("/staffs")
    public ResponseEntity<Page<StaffResponse>> listStaffs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        Page<StaffResponse> result = staffService
                .searchStaffs(keyword, status, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(StaffResponse::from);
        return ResponseEntity.ok(result);
    }

    @Operation(
            summary = "Xem chi tiết Staff",
            description = "Trả về thông tin chi tiết của Staff bao gồm danh sách các stations đang quản lý."
    )
    @GetMapping("/staffs/{id}")
    public ResponseEntity<?> getStaff(@PathVariable int id) {
        try {
            User staff = staffService.getStaffById(id);
            return ResponseEntity.ok(StaffResponse.from(staff));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
            summary = "Tạo Staff mới",
            description = "Tạo tài khoản Staff mới. Role tự động được gán là STAFF. Có thể kèm danh sách stationIds để gán stations ngay khi tạo."
    )
    @PostMapping("/staffs")
    public ResponseEntity<?> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        try {
            User created = staffService.createStaff(request);
            // Load lai voi stations de tra ve StaffResponse day du
            User staffWithStations = staffService.getStaffById(created.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(StaffResponse.from(staffWithStations));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
            summary = "Cập nhật thông tin Staff",
            description = "Cập nhật thông tin cơ bản của Staff (fullName, email, phone, password, status). Không thay đổi danh sách stations."
    )
    @PutMapping("/staffs/{id}")
    public ResponseEntity<?> updateStaff(
            @PathVariable int id,
            @Valid @RequestBody UserOnChangeRequest request
    ) {
        try {
            User updated = staffService.updateStaff(id, request);
            User staffWithStations = staffService.getStaffById(updated.getId());
            return ResponseEntity.ok(StaffResponse.from(staffWithStations));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
            summary = "Xóa Staff",
            description = "Xóa Staff bằng ID. Trả về 204 nếu thành công hoặc 404 nếu không tìm thấy."
    )
    @DeleteMapping("/staffs/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable int id) {
        try {
            staffService.deleteStaff(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
            summary = "Thay thế toàn bộ stations của Staff",
            description = "Thay thế toàn bộ danh sách stations mà Staff đang quản lý bằng danh sách mới. Gửi danh sách rỗng để gỡ tất cả stations."
    )
    @PutMapping("/staffs/{id}/stations")
    public ResponseEntity<?> replaceStaffStations(
            @PathVariable int id,
            @Valid @RequestBody StaffStationRequest request
    ) {
        try {
            User updated = staffService.replaceStations(id, request.stationIds());
            return ResponseEntity.ok(StaffResponse.from(updated));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
            summary = "Gán thêm stations cho Staff",
            description = "Thêm các stations vào danh sách quản lý của Staff. Stations đã tồn tại sẽ được bỏ qua (không bị trùng lặp)."
    )
    @PostMapping("/staffs/{id}/stations")
    public ResponseEntity<?> assignStaffStations(
            @PathVariable int id,
            @Valid @RequestBody StaffStationRequest request
    ) {
        try {
            User updated = staffService.assignStations(id, request.stationIds());
            return ResponseEntity.ok(StaffResponse.from(updated));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
            summary = "Gỡ stations khỏi Staff",
            description = "Gỡ các stations ra khỏi danh sách quản lý của Staff."
    )
    @DeleteMapping("/staffs/{id}/stations")
    public ResponseEntity<?> removeStaffStations(
            @PathVariable int id,
            @Valid @RequestBody StaffStationRequest request
    ) {
        try {
            User updated = staffService.removeStations(id, request.stationIds());
            return ResponseEntity.ok(StaffResponse.from(updated));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
            summary = "Lấy danh sách Staff theo Station",
            description = "Trả về danh sách tất cả Staff đang quản lý một station cụ thể."
    )
    @GetMapping("/staffs/by-station/{stationId}")
    public ResponseEntity<?> getStaffsByStation(@PathVariable int stationId) {
        try {
            List<User> staffs = staffService.getStaffsByStation(stationId);
            List<StaffResponse> result = staffs.stream()
                    .map(StaffResponse::from)
                    .toList();
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
