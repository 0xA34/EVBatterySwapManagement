package com.team4tech.evbatteryswap.dto.response;

public record LoginResponse(
        String accessToken,
        String tokenType,
        String role
) {
    public LoginResponse(String accessToken, String role) {
        this(accessToken, "Bearer", role);
    }
}
