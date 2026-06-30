package com.team4tech.evbatteryswap.controller.admin;

import com.team4tech.evbatteryswap.dto.response.StationTransactionResponse;
import com.team4tech.evbatteryswap.service.StationTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/station-transactions")
@Tag(name = "Admin - Station Transactions")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminStationTransactionController {

    private final StationTransactionService transactionService;

    @Operation(summary = "Lấy lịch sử giao dịch/doanh thu của một trạm")
    @GetMapping("/station/{stationId}")
    public ResponseEntity<Page<StationTransactionResponse>> getStationHistory(
            @PathVariable Integer stationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<StationTransactionResponse> result = transactionService.getStationHistory(
                stationId,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return ResponseEntity.ok(result);
    }
}
