package com.team4tech.evbatteryswap.controller;

import com.team4tech.evbatteryswap.dto.request.LoginRequest;
import com.team4tech.evbatteryswap.dto.response.LoginResponse;
import com.team4tech.evbatteryswap.security.ApiRateLimit;
import com.team4tech.evbatteryswap.security.JwtAuthenticationFilter;
import com.team4tech.evbatteryswap.security.JwtTokenProvider;
import com.team4tech.evbatteryswap.security.TokenBlacklistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Authentication", description = "Login / Logout endpoints")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;



    @PostMapping("/login")
    @ApiRateLimit(capacity = 5, minutes = 1)
    @Operation(
            summary = "Login",
            description = "Authenticate with username and password. Returns a Bearer JWT token. " +
                          "Copy the token and click **Authorize** at the top of this page to access protected endpoints."
    )
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(), request.password()));

        String token = jwtTokenProvider.generateToken(authentication.getName());

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(a -> a.replace("ROLE_", ""))
                .findFirst()
                .orElse("UNKNOWN");

        return ResponseEntity.ok(new LoginResponse(token, role));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Logout",
            description = "Invalidates the current JWT token. Works for **all roles** (Admin, Staff, Driver).",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        return performLogout(request);
    }

    // lay jwt tu authorisation header xong r oi them vao blacklist.
    private ResponseEntity<Map<String, String>> performLogout(HttpServletRequest request) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        if (StringUtils.hasText(token)) {
            long expiryMs = jwtTokenProvider.getExpirationFromToken(token).getTime();
            tokenBlacklistService.blacklist(token, expiryMs);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
