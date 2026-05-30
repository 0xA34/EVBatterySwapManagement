package com.team4tech.evbatteryswap.controller.driver;

import com.team4tech.evbatteryswap.dto.request.SupportTicketRequest;
import com.team4tech.evbatteryswap.dto.response.SupportTicketResponse;
import com.team4tech.evbatteryswap.entity.SupportTicket;
import com.team4tech.evbatteryswap.security.JwtAuthenticationFilter;
import com.team4tech.evbatteryswap.security.JwtTokenProvider;
import com.team4tech.evbatteryswap.service.UserService;
import com.team4tech.evbatteryswap.service.interfaces.ISupportTicketService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/driver/support-tickets")
@Tag(name = "Driver - Support Ticket", description = "Operations for drivers to create and view their support tickets")
@PreAuthorize("hasRole('DRIVER')")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class DriverSupportTicketController {

    ISupportTicketService supportTicketService;
    UserService userService;
    JwtAuthenticationFilter jwtAuthenticationFilter;
    JwtTokenProvider jwtTokenProvider;

    private Integer getUserIdFromToken(HttpServletRequest request) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        return userService.findByUsername(username).get().getId();
    }

    @Operation(summary = "Lấy danh sách các khiếu nại/hỗ trợ của tài xế")
    @GetMapping
    public ResponseEntity<Page<SupportTicketResponse>> getMyTickets(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Integer userId = getUserIdFromToken(request);
        Page<SupportTicketResponse> result = supportTicketService
                .findByUserId(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(SupportTicketResponse::from);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Xem chi tiết một ticket")
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketDetails(HttpServletRequest request, @PathVariable int id) {
        Integer userId = getUserIdFromToken(request);
        Optional<SupportTicket> ticketOpt = supportTicketService.findById(id);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SupportTicket ticket = ticketOpt.get();
        if (!ticket.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Bạn không có quyền xem ticket này."));
        }
        return ResponseEntity.ok(SupportTicketResponse.from(ticket));
    }

    @Operation(summary = "Tạo một ticket mới")
    @PostMapping
    public ResponseEntity<?> createTicket(
            HttpServletRequest request,
            @Valid @RequestBody SupportTicketRequest ticketRequest
    ) {
        Integer userId = getUserIdFromToken(request);
        try {
            Optional<SupportTicket> created = supportTicketService.createSupportTicket(userId, ticketRequest);
            return created.map(ticket -> ResponseEntity.status(HttpStatus.CREATED).body(SupportTicketResponse.from(ticket)))
                    .orElseGet(() -> ResponseEntity.badRequest().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
