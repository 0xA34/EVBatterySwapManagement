package com.team4tech.evbatteryswap.controller.staff;

import com.team4tech.evbatteryswap.dto.response.SwapOrderResponse;
import com.team4tech.evbatteryswap.security.JwtAuthenticationFilter;
import com.team4tech.evbatteryswap.security.JwtTokenProvider;
import com.team4tech.evbatteryswap.service.SwapOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/api/staff/swap-orders")
@Tag(name = "Staff - Swap Orders", description = "Quản lý hàng chờ đổi pin tại trạm")
@PreAuthorize("hasRole('STAFF')")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class StaffSwapOrderController {

    SwapOrderService swapOrderService;
    JwtAuthenticationFilter jwtAuthenticationFilter;
    JwtTokenProvider jwtTokenProvider;

    private String getUsername(HttpServletRequest request) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        return jwtTokenProvider.getUsernameFromToken(token);
    }

    @Operation(summary = "Xem danh sách hàng chờ đổi pin tại các trạm của staff")
    @GetMapping("/queue")
    public ResponseEntity<Page<SwapOrderResponse>> getQueue(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        String username = getUsername(request);
        Page<SwapOrderResponse> result = swapOrderService.getStaffQueue(
                username, PageRequest.of(page, size, Sort.by("createdAt").ascending()));
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Duyệt lệnh đổi pin (Approve)")
    @PutMapping("/{orderId}/approve")
    public ResponseEntity<SwapOrderResponse> approveOrder(@PathVariable int orderId) {
        SwapOrderResponse response = swapOrderService.approveOrder(orderId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Từ chối lệnh đổi pin (Reject)")
    @PutMapping("/{orderId}/reject")
    public ResponseEntity<SwapOrderResponse> rejectOrder(
            @PathVariable int orderId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String reason = body != null ? body.get("reason") : null;
        SwapOrderResponse response = swapOrderService.rejectOrder(orderId, reason);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Hoàn tất đổi pin khi driver đến trạm (Complete Booking)")
    @PutMapping("/{orderId}/complete")
    public ResponseEntity<SwapOrderResponse> completeBooking(@PathVariable int orderId) {
        SwapOrderResponse response = swapOrderService.completeBooking(orderId);
        return ResponseEntity.ok(response);
    }
}
