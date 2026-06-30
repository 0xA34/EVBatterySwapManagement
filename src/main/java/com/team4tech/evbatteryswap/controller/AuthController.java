package com.team4tech.evbatteryswap.controller;

import com.team4tech.evbatteryswap.dto.request.LoginRequest;
import com.team4tech.evbatteryswap.dto.response.LoginResponse;
import com.team4tech.evbatteryswap.repository.UserRepository;
import com.team4tech.evbatteryswap.security.ApiRateLimit;
import com.team4tech.evbatteryswap.security.JwtAuthenticationFilter;
import com.team4tech.evbatteryswap.security.JwtTokenProvider;
import com.team4tech.evbatteryswap.security.TokenBlacklistService;
import com.team4tech.evbatteryswap.service.RefreshTokenService;
import com.team4tech.evbatteryswap.service.interfaces.IUserService;
import com.team4tech.evbatteryswap.service.AuditLogService;
import com.team4tech.evbatteryswap.entity.RefreshToken;
import com.team4tech.evbatteryswap.entity.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
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
    private final RefreshTokenService refreshTokenService;
    private final IUserService userService;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;



    @PostMapping("/login")
    @ApiRateLimit(capacity = 5, minutes = 1)
    @Operation(
            summary = "Login",
            description = "Authenticate with username and password. Returns a Bearer JWT token. " +
                          "Copy the token and click **Authorize** at the top of this page to access protected endpoints."
    )
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse response) {
        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = httpRequest.getRemoteAddr();
        }

        User user = userService.findByUsername(request.username()).orElse(null);
        if (user != null && user.getLockoutUntil() != null) {
            if (user.getLockoutUntil().isAfter(java.time.Instant.now())) {
                auditLogService.logAction("LOGIN_BLOCKED", request.username(), "Account locked until " + user.getLockoutUntil(), ipAddress);
                throw new RuntimeException("Tài khoản của bạn đã bị khóa. Vui lòng thử lại sau.");
            } else {
                userRepository.resetFailedLoginAttempts(user.getUsername());
            }
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.username(), request.password()));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            if (user != null) {
                userRepository.incrementFailedLoginAttempts(user.getUsername());
                if (user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() >= 4) { // Next is 5
                    userRepository.lockUser(user.getUsername(), java.time.Instant.now().plus(15, java.time.temporal.ChronoUnit.MINUTES));
                    auditLogService.logAction("ACCOUNT_LOCKED", request.username(), "Account locked due to too many failed login attempts", ipAddress);
                } else {
                    auditLogService.logAction("LOGIN_FAILED", request.username(), "Invalid credentials", ipAddress);
                }
            } else {
                auditLogService.logAction("LOGIN_FAILED", request.username(), "Unknown username", ipAddress);
            }
            throw e;
        }

        if (user != null) {
            userRepository.resetFailedLoginAttempts(user.getUsername());
            user.setSessionVersion(user.getSessionVersion() == null ? 1 : user.getSessionVersion() + 1);
            userRepository.save(user);
        }

        String token = jwtTokenProvider.generateToken(authentication.getName(), user != null ? user.getSessionVersion() : 1);

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(a -> a.replace("ROLE_", ""))
                .findFirst()
                .orElse("UNKNOWN");

        user = userService.findByUsername(authentication.getName()).orElseThrow();
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        Cookie cookie = new Cookie("refreshToken", refreshToken.getToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Should be true in production with HTTPS
        cookie.setPath("/api/auth/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(cookie);

        auditLogService.logAction("LOGIN_SUCCESS", request.username(), "User logged in successfully", ipAddress);

        return ResponseEntity.ok(new LoginResponse(token, role));
    }
    @PostMapping("/register")
    @Operation(summary = "Register a new driver account", description = "Public API to register a new user. The role is automatically set to DRIVER.")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody com.team4tech.evbatteryswap.dto.request.UserRegisterRequest request) {
        // Force role to DRIVER and status to ACTIVE for public registrations
        com.team4tech.evbatteryswap.dto.request.UserRegisterRequest driverRequest = new com.team4tech.evbatteryswap.dto.request.UserRegisterRequest(
                request.username(),
                request.fullName(),
                request.email(),
                request.phoneNumber(),
                request.password(),
                "DRIVER",
                "ACTIVE"
        );
        userService.createUser(driverRequest);

        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "User registered successfully");
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh Token", description = "Get a new access token using the HttpOnly refresh token cookie.")
    public ResponseEntity<LoginResponse> refreshToken(@CookieValue(name = "refreshToken", required = false) String requestRefreshToken) {
        if (requestRefreshToken == null || requestRefreshToken.isBlank()) {
            return ResponseEntity.status(401).body(null);
        }

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtTokenProvider.generateToken(user.getUsername(), user.getSessionVersion());
                    return ResponseEntity.ok(new LoginResponse(token, user.getRole()));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Logout",
            description = "Invalidates the current JWT token. Works for **all roles** (Admin, Staff, Driver).",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request, HttpServletResponse response, @CookieValue(name = "refreshToken", required = false) String requestRefreshToken) {
        if (requestRefreshToken != null && !requestRefreshToken.isBlank()) {
            refreshTokenService.revokeToken(requestRefreshToken);
            Cookie cookie = new Cookie("refreshToken", null);
            cookie.setHttpOnly(true);
            cookie.setSecure(false);
            cookie.setPath("/api/auth/");
            cookie.setMaxAge(0);
            response.addCookie(cookie);
        }
        
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        if (StringUtils.hasText(token)) {
            try {
                String username = jwtTokenProvider.getUsernameFromToken(token);
                auditLogService.logAction("LOGOUT", username, "User logged out", ipAddress);
            } catch (Exception e) {
                // Ignore token extraction errors on logout
            }
        }
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
