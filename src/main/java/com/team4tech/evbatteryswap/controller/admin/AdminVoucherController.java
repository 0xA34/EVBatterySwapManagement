package com.team4tech.evbatteryswap.controller.admin;

import com.team4tech.evbatteryswap.dto.request.VoucherRequest;
import com.team4tech.evbatteryswap.dto.response.VoucherResponse;
import com.team4tech.evbatteryswap.service.interfaces.IVoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/vouchers")
@Tag(name = "Admin - Voucher Management")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminVoucherController {

    private final IVoucherService voucherService;

    @Operation(summary = "Lấy danh sách mã giảm giá")
    @GetMapping
    public ResponseEntity<Page<VoucherResponse>> listVouchers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<VoucherResponse> result = voucherService.getAllVouchers(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Lấy chi tiết mã giảm giá")
    @GetMapping("/{id}")
    public ResponseEntity<VoucherResponse> getVoucher(@PathVariable int id) {
        return ResponseEntity.ok(voucherService.getVoucherById(id));
    }

    @Operation(summary = "Tạo mã giảm giá mới")
    @PostMapping
    public ResponseEntity<?> createVoucher(@Valid @RequestBody VoucherRequest request) {
        try {
            VoucherResponse created = voucherService.createVoucher(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Cập nhật mã giảm giá")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVoucher(
            @PathVariable int id,
            @Valid @RequestBody VoucherRequest request
    ) {
        try {
            VoucherResponse updated = voucherService.updateVoucher(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Xóa mã giảm giá")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable int id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }
}
