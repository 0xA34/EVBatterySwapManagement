package com.team4tech.evbatteryswap.controller.driver;

import com.team4tech.evbatteryswap.dto.request.SwapOrderRequest;
import com.team4tech.evbatteryswap.dto.response.SwapOrderResponse;
import com.team4tech.evbatteryswap.security.JwtAuthenticationFilter;
import com.team4tech.evbatteryswap.security.JwtTokenProvider;
import com.team4tech.evbatteryswap.service.SwapOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/driver/swap-orders")
@Tag(name = "Driver - Swap Orders", description = "Đặt lịch & yêu cầu đổi pin cho tài xế")
@PreAuthorize("hasRole('DRIVER')")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class DriverSwapOrderController {

    SwapOrderService swapOrderService;
    JwtAuthenticationFilter jwtAuthenticationFilter;
    JwtTokenProvider jwtTokenProvider;

    private String getUsername(HttpServletRequest request) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        return jwtTokenProvider.getUsernameFromToken(token);
    }

    @Operation(summary = "Đặt lịch đổi pin (Booking)")
    @PostMapping("/booking")
    public ResponseEntity<SwapOrderResponse> createBooking(
            HttpServletRequest request,
            @Valid @RequestBody SwapOrderRequest payload
    ) {
        String username = getUsername(request);
        SwapOrderResponse response = swapOrderService.createBooking(username, payload);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Yêu cầu đổi pin trực tiếp (Direct Swap)")
    @PostMapping("/direct-swap")
    public ResponseEntity<SwapOrderResponse> createDirectSwap(
            HttpServletRequest request,
            @Valid @RequestBody SwapOrderRequest payload
    ) {
        String username = getUsername(request);
        SwapOrderResponse response = swapOrderService.createDirectSwap(username, payload);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Xem lệnh đang chờ xử lý (nếu có)")
    @GetMapping("/active")
    public ResponseEntity<?> getActiveOrder(HttpServletRequest request) {
        String username = getUsername(request);
        SwapOrderResponse active = swapOrderService.getActiveOrder(username);
        if (active == null) {
            return ResponseEntity.ok(Map.of("message", "Không có lệnh nào đang chờ xử lý."));
        }
        return ResponseEntity.ok(active);
    }

    @Operation(summary = "Xem lịch sử các lệnh đổi pin")
    @GetMapping("/history")
    public ResponseEntity<Page<SwapOrderResponse>> getHistory(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String username = getUsername(request);
        Page<SwapOrderResponse> result = swapOrderService.getDriverHistory(
                username, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Hủy lệnh đặt lịch / đổi pin")
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<SwapOrderResponse> cancelOrder(
            HttpServletRequest request,
            @PathVariable int orderId
    ) {
        String username = getUsername(request);
        SwapOrderResponse response = swapOrderService.cancelOrder(username, orderId);
        return ResponseEntity.ok(response);
    }
}
