package com.team4tech.evbatteryswap.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserOnChangeRequest(

        @NotBlank(message = "Họ tên đầy đủ không được để trống.")
        @Size(max = 255)
        String fullName,

        @Email(message = "Sai cú pháp email.")
        @Size(max = 255)
        String email,

        @Size(max = 11, message = "Số điện thoại phải tối đa 11 số.")
        String phoneNumber,

        // Optional
        String password,

        String role,

        String status
) {}
