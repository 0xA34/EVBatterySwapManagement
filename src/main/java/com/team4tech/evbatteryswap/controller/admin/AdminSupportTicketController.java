package com.team4tech.evbatteryswap.controller.admin;

import com.team4tech.evbatteryswap.dto.request.UpdateSupportTicketRequest;
import com.team4tech.evbatteryswap.dto.response.SupportTicketResponse;
import com.team4tech.evbatteryswap.entity.SupportTicket;
import com.team4tech.evbatteryswap.service.interfaces.ISupportTicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
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
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/support-tickets")
@Tag(name = "Admin - Support Ticket Management", description = "Operations for admins to view and respond to support tickets")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AdminSupportTicketController {

    ISupportTicketService supportTicketService;

    @Operation(summary = "Lấy danh sách toàn bộ ticket, có hỗ trợ filter theo trạng thái và độ ưu tiên")
    @GetMapping("/page")
    public ResponseEntity<Page<SupportTicketResponse>> getTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority
    ) {
        Page<SupportTicketResponse> result = supportTicketService
                .searchAndFilter(status, priority, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(SupportTicketResponse::from);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Xem chi tiết một ticket")
    @GetMapping("/{id}")
    public ResponseEntity<SupportTicketResponse> getTicketDetails(@PathVariable int id) {
        Optional<SupportTicket> ticketOpt = supportTicketService.findById(id);
        return ticketOpt.map(ticket -> ResponseEntity.ok(SupportTicketResponse.from(ticket)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Cập nhật trạng thái, độ ưu tiên, hoặc phản hồi ticket")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTicket(
            @PathVariable int id,
            @Valid @RequestBody UpdateSupportTicketRequest request
    ) {
        try {
            SupportTicket updated = supportTicketService.updateTicket(id, request);
            return ResponseEntity.ok(SupportTicketResponse.from(updated));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/countResponse")
    public ResponseEntity<Map<String, Long>> getSupportTicketCount() {
        return ResponseEntity.ok(supportTicketService.getTicketStats());
    }



}
