package com.team4tech.evbatteryswap.controller.admin;

import com.team4tech.evbatteryswap.dto.request.UserOnChangeRequest;
import com.team4tech.evbatteryswap.dto.request.UserRegisterRequest;
import com.team4tech.evbatteryswap.dto.response.StationStatusCountResponse;
import com.team4tech.evbatteryswap.dto.response.UserResponse;
import com.team4tech.evbatteryswap.dto.response.UserRoleCountResponse;
import com.team4tech.evbatteryswap.dto.response.UserStatusCountResponse;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.service.UserService;
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
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
@Tag(name = "Admin - User Management", description = "CRUD operations for managing users (Admin only)")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

//    @Operation(
//        summary = "Liệt kê tất cả người dùng",
//        description = "Trả về danh sách người dùng được phân trang. Hỗ trợ tìm kiếm từ khóa theo tên người dùng, họ tên hoặc email."
//    )
//    @GetMapping
//    public ResponseEntity<Page<UserResponse>> listUsers(
//            @RequestParam(defaultValue = "0")  int page,
//            @RequestParam(defaultValue = "15") int size,
//            @RequestParam(required = false) String search
//    ) {
//        Page<UserResponse> result = userService
//                .filterByKeyword(search, PageRequest.of(page, size, Sort.by("createdAt").descending()))
//                .map(UserResponse::from);
//        return ResponseEntity.ok(result);
//    }

    @Operation(summary = "Tìm user theo ID")

    @GetMapping("/role")
    public ResponseEntity<Map<String, String>> getListRole() {
        Map<String, String> roleMap = new LinkedHashMap<>();

        roleMap.put("ADMIN", "Quản Trị Viên");
        roleMap.put("STAFF", "Nhân Viên Trạm");
        roleMap.put("DRIVER", "Khách Hàng");

        return ResponseEntity.ok(roleMap);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getListStatus() {
        Map<String, String> statusMap = new LinkedHashMap<>();
        statusMap.put("ACTIVE", "Đang Hoạt Động");
        statusMap.put("BANNED", "Vô Hiệu Hóa");
        statusMap.put("CHECKPOINT", "Chờ Phê Duyệt");
        return ResponseEntity.ok(statusMap);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable int id) {
        return userService.findById(id)
                .map(UserResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Tìm kiếm user theo username", description = "Tìm kiếm không phân biệt hoa thường, có phân trang.")
    @GetMapping("/search")
    public ResponseEntity<Page<UserResponse>> searchUsers(
            @RequestParam String username,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<UserResponse> result = userService
                .searchByUsername(username, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(UserResponse::from);
        return ResponseEntity.ok(result);
    }


    @GetMapping("/getListUsers")
    public ResponseEntity<Page<UserResponse>> getListUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role
    ) {
        Page<UserResponse> result = userService
                .searchAndFilterUsers(keyword, status, role, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(UserResponse::from);
        return ResponseEntity.ok(result);
    }


    @Operation(
        summary = "Tạo một user mới",
        description = "Tạo tài khoản người dùng mới. Trả về mã 400 nếu tên người dùng hoặc email đã tồn tại."
    )
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserRegisterRequest request) {
        try {
            User created = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
        summary = "Cập nhật user đang có tồn tại",
        description = "Cập nhật thông tin người dùng theo ID. Trường mật khẩu là tùy chọn — bỏ qua trường này để giữ nguyên mật khẩu hiện tại. Trả về mã lỗi 404 nếu người dùng không tồn tại, hoặc 400 nếu tên người dùng/email trùng với người dùng khác."
    )
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable int id,
            @Valid @RequestBody UserOnChangeRequest request
    ) {
        try {
            User updated = userService.updateUser(id, request);
            return ResponseEntity.ok(UserResponse.from(updated));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(
        summary = "Xóa một User.",
        description = "Xóa một user bằng ID. Trả về 204 nếu thành công hoặc 404 nếu user đó không tồn tại."
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/count")
    public List<?> getCount(@RequestParam String type) {
        if (type.equals("role")) {
            List<UserRoleCountResponse> roleCount = userService.countUsersByRole();
            return roleCount;
        }  else if (type.equals("status")) {
            List<UserStatusCountResponse> statusCount = userService.countUsersByStatus();
            return statusCount;
        } else return null;
    }


}
