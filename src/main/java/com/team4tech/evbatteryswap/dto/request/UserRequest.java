package com.team4tech.evbatteryswap.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRequest(
        @NotBlank(message = "Username is required")
        @Size(max = 255)
        String username,

        @NotBlank(message = "Full name is required")
        @Size(max = 255)
        String fullName,

        @Email(message = "Invalid email format")
        @Size(max = 255)
        String email,

        @Size(max = 20, message = "Phone number must be at most 20 characters")
        String phoneNumber,

        // Nullable khi update (khong bat buoc doi mat khau), CHI bat buoc khi create.
        String password,

        String role,

        String status
) {}
