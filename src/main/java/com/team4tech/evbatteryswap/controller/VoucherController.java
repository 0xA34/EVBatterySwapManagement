package com.team4tech.evbatteryswap.controller;

import com.team4tech.evbatteryswap.dto.response.VoucherResponse;
import com.team4tech.evbatteryswap.entity.Voucher;
import com.team4tech.evbatteryswap.service.interfaces.IVoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vouchers")
@Tag(name = "Voucher Management")
@CrossOrigin(origins = "http://localhost:5173")
public class VoucherController {

    private final IVoucherService voucherService;

    @Operation(summary = "Kiểm tra mã giảm giá", description = "Kiểm tra mã giảm giá có hợp lệ không trước khi tạo order")
    @GetMapping("/check")
    public ResponseEntity<?> checkVoucher(@RequestParam String code) {
        try {
            Voucher voucher = voucherService.validateAndGetVoucher(code);
            if (voucher == null) {
                 return ResponseEntity.badRequest().body(Map.of("error", "Mã giảm giá rỗng."));
            }
            return ResponseEntity.ok(VoucherResponse.from(voucher));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
