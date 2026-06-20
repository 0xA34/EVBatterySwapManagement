package com.team4tech.evbatteryswap.controller;

import com.team4tech.evbatteryswap.dto.response.UserResponse;
import com.team4tech.evbatteryswap.security.JwtAuthenticationFilter;
import com.team4tech.evbatteryswap.security.JwtTokenProvider;
import com.team4tech.evbatteryswap.service.interfaces.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Tag(name = "Profile", description = "API lấy thông tin cá nhân, chung cho 3 roles.")
public class ProfileController {

    JwtAuthenticationFilter jwtAuthenticationFilter;
    JwtTokenProvider jwtTokenProvider;
    IUserService userService;

    @Operation(
            summary = "API lấy thông tin cá nhân",
            description = "Trả về thông tin chi tiết của người dùng đang đăng nhập (ADMIN, STAFF, DRIVER)"
    )
    @GetMapping("/info")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'DRIVER')")
    public ResponseEntity<UserResponse> getInfo(HttpServletRequest request) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);

        return userService.findByUsername(username)
                .map(UserResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
