package com.team4tech.evbatteryswap.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record StaffStationRequest(
        @NotNull(message = "Danh sách station IDs không được để trống.")
        List<Integer> stationIds
) {}
