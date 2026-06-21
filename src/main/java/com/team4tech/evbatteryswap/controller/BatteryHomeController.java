package com.team4tech.evbatteryswap.controller;

import com.team4tech.evbatteryswap.dto.response.BatteryResponse;
import com.team4tech.evbatteryswap.entity.Battery;
import com.team4tech.evbatteryswap.service.BatteryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/battery")
@CrossOrigin(origins = "http://localhost:5173")
public class BatteryHomeController {

    private final BatteryService batteryService;

    @GetMapping("/page")
    public ResponseEntity<Page<BatteryResponse>> getBatteryPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer stationId
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Battery> batteryPage = batteryService.findBatteriesByStationIds(stationId, status, pageable);
        if (batteryPage == null || batteryPage.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Page<BatteryResponse> responsePage = batteryPage.map(BatteryResponse::from);

        return ResponseEntity.ok(responsePage);
    }

}
