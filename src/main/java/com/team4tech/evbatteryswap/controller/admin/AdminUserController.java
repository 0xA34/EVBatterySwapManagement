package com.team4tech.evbatteryswap.controller.admin;

import com.team4tech.evbatteryswap.dto.request.UserRequest;
import com.team4tech.evbatteryswap.dto.response.UserResponse;
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

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
@Tag(name = "Admin - User Management", description = "CRUD operations for managing users (Admin only)")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @Operation(
        summary = "Liệt kê tất cả người dùng",
        description = "Trả về danh sách người dùng được phân trang. Hỗ trợ tìm kiếm từ khóa theo tên người dùng, họ tên hoặc email."
    )
    @GetMapping
    public ResponseEntity<Page<UserResponse>> listUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false)    String search
    ) {
        Page<UserResponse> result = userService
                .filterUsers(search, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(UserResponse::from);
        return ResponseEntity.ok(result);
    }

    @Operation(
        summary = "Tìm người dùng theo ID",
        description = "Trả về thông tin của một người dùng duy nhất dựa trên ID của họ. Trả về mã lỗi 404 nếu người dùng không tồn tại."
    )
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable int id) {
        return userService.findById(id)
                .map(UserResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Tạo một user mới",
        description = "Tạo tài khoản người dùng mới. Trả về mã 400 nếu tên người dùng hoặc email đã tồn tại."
    )
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserRequest request) {
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
            @Valid @RequestBody UserRequest request
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
}
