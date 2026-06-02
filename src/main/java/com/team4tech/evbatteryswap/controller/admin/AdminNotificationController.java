package com.team4tech.evbatteryswap.controller.admin;

import com.team4tech.evbatteryswap.dto.request.CustomNotificationRequest;
import com.team4tech.evbatteryswap.dto.response.NotificationResponse;
import com.team4tech.evbatteryswap.entity.Notification;
import com.team4tech.evbatteryswap.security.JwtAuthenticationFilter;
import com.team4tech.evbatteryswap.security.JwtTokenProvider;
import com.team4tech.evbatteryswap.service.NotificationService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/notifications")
@Tag(name = "Admin - Notifications", description = "View and manage notifications for admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AdminNotificationController {

    NotificationService notificationService;
    UserService userService;
    JwtAuthenticationFilter jwtAuthenticationFilter;
    JwtTokenProvider jwtTokenProvider;

    private Integer getUserId(HttpServletRequest request) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        return userService.findByUsername(username).get().getId();
    }

    @Operation(summary = "Lấy danh sách thông báo của admin")
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Integer userId = getUserId(request);
        Page<NotificationResponse> result = notificationService
                .getNotifications(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(NotificationResponse::from);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Đếm số thông báo chưa đọc")
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(HttpServletRequest request) {
        Integer userId = getUserId(request);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @Operation(summary = "Đánh dấu một thông báo đã đọc")
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(HttpServletRequest request, @PathVariable int id) {
        Integer userId = getUserId(request);
        try {
            Notification notification = notificationService.markAsRead(id, userId);
            return ResponseEntity.ok(NotificationResponse.from(notification));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Đánh dấu tất cả thông báo đã đọc")
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(HttpServletRequest request) {
        Integer userId = getUserId(request);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Gửi thông báo tùy chỉnh cho nhóm người hoặc cá nhân")
    @PostMapping("/custom")
    public ResponseEntity<Map<String, String>> sendCustomNotification(
            HttpServletRequest request,
            @RequestBody @Valid CustomNotificationRequest payload
    ) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        com.team4tech.evbatteryswap.entity.User sender = userService.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Sender not found"));
        
        notificationService.sendCustomNotification(payload, sender);
        
        return ResponseEntity.ok(Map.of("message", "Đã gửi thông báo thành công tới " + payload.getTargetAudience().name()));
    }
}
