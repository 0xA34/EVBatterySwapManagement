package com.team4tech.evbatteryswap.controller.driver;


import com.team4tech.evbatteryswap.dto.request.SupportTicketRequest;
import com.team4tech.evbatteryswap.dto.response.SupportTicketResponse;
import com.team4tech.evbatteryswap.dto.response.UserResponse;
import com.team4tech.evbatteryswap.entity.SupportTicket;
import com.team4tech.evbatteryswap.security.JwtAuthenticationFilter;
import com.team4tech.evbatteryswap.security.JwtTokenProvider;
import com.team4tech.evbatteryswap.service.SupportTicketService;
import com.team4tech.evbatteryswap.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DRIVER')")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Tag(name = "API User - Driver", description = "Danh sách các API của người dùng, tài xế")
public class UserController {

    UserService userService;
    SupportTicketService supportTicketService;
    JwtAuthenticationFilter jwtAuthenticationFilter;
    JwtTokenProvider jwtTokenProvider;
    PasswordEncoder passwordEncoder;


    public boolean checkPassword(int id, String oldPassword) {
        // 1. Tìm mật khẩu đã mã hóa trong DB
        Optional<String> userPasswordOpt = userService.findPasswordById(id);

        if (userPasswordOpt.isEmpty()) {
            return false; // Không tìm thấy người dùng
        }

        String encodedPasswordInDb = userPasswordOpt.get();

        // 2. Dùng .matches(mật_khẩu_thô, mật_khẩu_đã_mã_hóa_trong_db)
        return passwordEncoder.matches(oldPassword, encodedPasswordInDb);
    }


    @Operation(
            summary = "API lấy thông tin người dùng",
            description = "Trả về danh sách thông tin người dùng - tài xế"
    )
    @GetMapping("/info")
    public ResponseEntity<UserResponse> getInfo(HttpServletRequest request) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);

        return userService.findByUsername(username)
                .map(UserResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @Operation(
            summary = "API cập nhật địa chỉ email mới",
            description = "Cập nhật thông tin liên hệ Email người dùng - tài xế"
    )
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


    @Operation(
            summary = "API cập nhật số điện thoại mới",
            description = "Cập nhật thông tin liên hệ số điện thoại người dùng - tài xế"
    )
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


    @Operation(
            summary = "API cập nhật mật khẩu người dùng",
            description = "Cập nhật mật khẩu người dùng - tài xế"
    )
    @PostMapping("/update-password")
    public ResponseEntity<String> updatePassword(
            HttpServletRequest request,
            @RequestParam() String oldPassword,
            @RequestParam() String newPassword
    ) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        Integer id = userService.findByUsername(username).get().getId();
        if (checkPassword(id, oldPassword)){

            String encodedPassword = passwordEncoder.encode(newPassword);

            if (userService.updatePasswordById(id, encodedPassword)) {
                return ResponseEntity.ok().body("Password Updated");
            } else {
                return ResponseEntity.badRequest().body("Password already exists");
            }

        } else {
            return ResponseEntity.badRequest().body("Password doesn't match");
        }
    }

    @GetMapping("/page/SupportTicket")
    public Page<SupportTicket> getSupportTicketPage(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        Integer id = userService.findByUsername(username).get().getId();
        Pageable pageable = PageRequest.of(page, size);
        return supportTicketService.findByUserId(id, pageable);
    }


    @PostMapping("/createSupportTicket")
    public ResponseEntity<SupportTicketResponse> createSupportTicket(
            HttpServletRequest request,
            @Valid @RequestBody SupportTicketRequest supportTicketRequest
    ) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        Integer id = userService.findByUsername(username).get().getId();
        Optional<SupportTicket> supportTicket = supportTicketService.createSupportTicket(id, supportTicketRequest);
        return supportTicket
                .map(SupportTicketResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }



}
