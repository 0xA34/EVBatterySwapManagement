package com.team4tech.evbatteryswap.controller;

import com.team4tech.evbatteryswap.dto.response.StationHomeResponse;
import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/station")
public class StationHomeController {

    private final StationService stationService;

    @GetMapping("/page")
    public Page<StationHomeResponse> getStationPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer quan,
            @RequestParam(required = false) Integer province,
            @RequestParam(required = false) Integer phuongxa
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return stationService.findStationsWithKeywordHome(keyword, status, quan, province, phuongxa, pageable);
    }



}
