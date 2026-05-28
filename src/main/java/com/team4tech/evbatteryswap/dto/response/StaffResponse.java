package com.team4tech.evbatteryswap.dto.response;

import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.entity.User;

import java.math.BigDecimal;
import java.util.List;

public record StaffResponse(
        Integer id,
        String username,
        String fullName,
        String email,
        String phoneNumber,
        BigDecimal walletBalance,
        String role,
        String status,
        List<StationSummary> stations
) {

    public record StationSummary(
            Integer id,
            String name,
            String address,
            String status
    ) {
        public static StationSummary from(Station station) {
            return new StationSummary(
                    station.getId(),
                    station.getName(),
                    station.getAddress(),
                    station.getStatus()
            );
        }
    }

    public static StaffResponse from(User user) {
        List<StationSummary> stationSummaries = user.getStations() != null
                ? user.getStations().stream()
                    .map(StationSummary::from)
                    .toList()
                : List.of();

        return new StaffResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getWalletBalance(),
                user.getRole(),
                user.getStatus(),
                stationSummaries
        );
    }
}
