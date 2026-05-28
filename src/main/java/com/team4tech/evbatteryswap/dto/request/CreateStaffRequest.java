package com.team4tech.evbatteryswap.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateStaffRequest(

        @NotBlank(message = "Username là bắt buộc.")
        @Size(max = 255)
        String username,

        @NotBlank(message = "Họ tên đầy đủ là bắt buộc.")
        @Size(max = 255)
        String fullName,

        @Email(message = "Sai cú pháp email.")
        @Size(max = 255)
        String email,

        @Size(max = 20, message = "Số điện thoại phải tối đa 20 ký tự.")
        String phoneNumber,

        @NotBlank(message = "Mật khẩu là bắt buộc.")
        String password,

        String status,

        // Optional: gán stations ngay khi tạo staff
        List<Integer> stationIds
) {}
