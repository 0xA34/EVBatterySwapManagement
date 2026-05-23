package com.team4tech.evbatteryswap.controller.driver;


import com.team4tech.evbatteryswap.dto.response.UserResponse;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.security.JwtAuthenticationFilter;
import com.team4tech.evbatteryswap.security.JwtTokenProvider;
import com.team4tech.evbatteryswap.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DRIVER')")
public class UserController {

    private final UserService userService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/info")
    public ResponseEntity<UserResponse> getInfo(HttpServletRequest request) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);

        return userService.findByUsername(username)
                .map(UserResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PostMapping("/update-email")
    public ResponseEntity<String> updateEmails(
            HttpServletRequest request,
            @RequestParam() String newEmail
    ) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        Integer id = userService.findByUsername(username).get().getId();
        if (userService.updateEmail(id, newEmail)) {
            return ResponseEntity.ok().body("Email Updated");
        }
        return ResponseEntity.badRequest().body("Email already exists");
    }


    @PostMapping("/update-phone")
    public ResponseEntity<String> updatePhones(
            HttpServletRequest request,
            @RequestParam() String newPhone
    ) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        Integer id = userService.findByUsername(username).get().getId();
        if (userService.updatePhone(id, newPhone)) {
            return ResponseEntity.ok().body("Phone Updated");
        }
        return ResponseEntity.badRequest().body("Phone already exists");
    }



}
