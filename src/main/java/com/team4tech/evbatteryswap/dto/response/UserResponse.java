package com.team4tech.evbatteryswap.dto.response;

import com.team4tech.evbatteryswap.entity.User;

import java.math.BigDecimal;
import java.time.Instant;

public record UserResponse(
        Integer id,
        String username,
        String fullName,
        String email,
        String phoneNumber,
        BigDecimal walletBalance,
        String role,
        String status
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getWalletBalance(),
                user.getRole(),
                user.getStatus()
        );
    }
}
