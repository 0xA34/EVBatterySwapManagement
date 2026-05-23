package com.team4tech.evbatteryswap.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRegisterRequest(

        @NotBlank(message = "Username là bắt buộc.")
        @Size(max = 255)
        String username,

        @NotBlank(message = "Họ tên đầy đủ là bắt buộc.")
        @Size(max = 255)
        String fullName,

        @Email(message = "Sai cú pháp email.")
        @Size(max = 255)
        String email,

        @Size(max = 20, message = "Số điện thoại phải tối đa 11 số.")
        String phoneNumber,

        // Bat buoc khi tao user moi
        @NotBlank(message = "Mật khẩu là bắt buộc.")
        String password,

        String role,

        String status
) {}
