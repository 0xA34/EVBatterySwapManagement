package com.team4tech.evbatteryswap.controller.driver;

import com.team4tech.evbatteryswap.dto.request.RentRequest;
import com.team4tech.evbatteryswap.dto.request.SupportTicketRequest;
import com.team4tech.evbatteryswap.dto.request.SwapRequest;
import com.team4tech.evbatteryswap.dto.response.BatteryResponse;
import com.team4tech.evbatteryswap.dto.response.SupportTicketResponse;
import com.team4tech.evbatteryswap.dto.response.SwapResponse;
import com.team4tech.evbatteryswap.dto.response.UserResponse;
import com.team4tech.evbatteryswap.entity.Battery;
import com.team4tech.evbatteryswap.entity.StationReview;
import com.team4tech.evbatteryswap.entity.SupportTicket;
import com.team4tech.evbatteryswap.security.JwtAuthenticationFilter;
import com.team4tech.evbatteryswap.security.JwtTokenProvider;
import com.team4tech.evbatteryswap.service.BatterySwapService;
import com.team4tech.evbatteryswap.service.BatteryService;
import com.team4tech.evbatteryswap.service.StationReviewService;
import com.team4tech.evbatteryswap.service.StationService;
import com.team4tech.evbatteryswap.service.SupportTicketService;
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
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
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
    StationReviewService stationReviewService;
    JwtAuthenticationFilter jwtAuthenticationFilter;
    JwtTokenProvider jwtTokenProvider;
    PasswordEncoder passwordEncoder;
    BatterySwapService batterySwapService;
    BatteryService batteryService;

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
        Integer userId = userService.findByUsername(username).get().getId();
        if (userService.updateEmail(userId, newEmail)) {
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
        Integer userId = userService.findByUsername(username).get().getId();
        if (userService.updatePhone(userId, newPhone)) {
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
        Integer userId = userService.findByUsername(username).get().getId();
        if (checkPassword(userId, oldPassword)){

            String encodedPassword = passwordEncoder.encode(newPassword);

            if (userService.updatePasswordById(userId, encodedPassword)) {
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
        Integer userId = userService.findByUsername(username).get().getId();
        Pageable pageable = PageRequest.of(page, size);
        return supportTicketService.findByUserId(userId, pageable);
    }


    @GetMapping("/page/StationReview")
    public Page<StationReview> getStationReviewPage(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        Integer userId = userService.findByUsername(username).get().getId();
        Pageable pageable = PageRequest.of(page, size);
        return stationReviewService.findByUserId(userId,  pageable);
    }


    @PostMapping("/createSupportTicket")
    public ResponseEntity<SupportTicketResponse> createSupportTicket(
            HttpServletRequest request,
            @Valid @RequestBody SupportTicketRequest supportTicketRequest
    ) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        Integer userId = userService.findByUsername(username).get().getId();
        Optional<SupportTicket> supportTicket = supportTicketService.createSupportTicket(userId, supportTicketRequest);
        return supportTicket
                .map(SupportTicketResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }



    @Operation(
            summary = "Thuê pin mới (dành cho tài xế mới)",
            description = "Tài xế chưa có pin IN_USE có thể thuê pin đầu tiên tại một trạm. " +
                          "Hệ thống sẽ tìm pin tốt nhất (giống swap), gán cho tài xế và tính SoH (ON_RENT)."
    )
    @PostMapping("/rent")
    public ResponseEntity<?> rentBattery(
            HttpServletRequest httpRequest,
            @Valid @RequestBody RentRequest rentRequest
    ) {
        String token    = jwtAuthenticationFilter.extractJwtFromRequest(httpRequest);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        try {
            BatteryResponse response = batterySwapService.rent(username, rentRequest);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @Operation(
            summary = "Yêu cầu đổi pin",
            description = "Tài xế gửi yêu cầu đổi pin tại một trạm. " +
                          "Hệ thống tự tìm pin tốt nhất tại trạm (AVAILABLE, đủ charge, SoH cao nhất), " +
                          "tả pin cũ về trạm, tính lại SoH và ghi log."
    )
    @PostMapping("/swap")
    public ResponseEntity<?> swapBattery(
            HttpServletRequest httpRequest,
            @Valid @RequestBody SwapRequest swapRequest
    ) {
        String token    = jwtAuthenticationFilter.extractJwtFromRequest(httpRequest);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        try {
            SwapResponse response = batterySwapService.swap(username, swapRequest);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @Operation(
            summary = "Xem pin hiện tại của tôi",
            description = "Trả về thông tin pin đang được gán cho tài xế (status = IN_USE). " +
                          "Trả về 404 nếu tài xế chưa có pin."
    )
    @GetMapping("/my-battery")
    public ResponseEntity<?> getMyBattery(HttpServletRequest httpRequest) {
        String token    = jwtAuthenticationFilter.extractJwtFromRequest(httpRequest);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        try {
            Battery battery = batterySwapService.getCurrentBattery(username);
            return ResponseEntity.ok(BatteryResponse.from(battery));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @Operation(
            summary = "Xem danh sách pin khả dụng tại trạm",
            description = "Trả về danh sách pin đang AVAILABLE tại một trạm cụ thể để tài xế có thể chọn."
    )
    @GetMapping("/stations/{id}/available-batteries")
    public ResponseEntity<Page<BatteryResponse>> getAvailableBatteriesAtStation(
            @PathVariable int id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<BatteryResponse> result = batteryService
                .findBatteries("AVAILABLE", id, null, null, null, null, PageRequest.of(page, size))
                .map(BatteryResponse::from);
        return ResponseEntity.ok(result);
    }

}
