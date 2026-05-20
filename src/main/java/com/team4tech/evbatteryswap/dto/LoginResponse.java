package com.team4tech.evbatteryswap.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        String role
) {
    public LoginResponse(String accessToken, String role) {
        this(accessToken, "Bearer", role);
    }
}
