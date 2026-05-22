package com.team4tech.evbatteryswap.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StationRequest(

        @NotBlank(message = "Tên trạm không được để trống")
        @Size(max = 255)
        String name,

        @NotBlank(message = "Địa chỉ không được để trống")
        String address,

        @NotNull(message = "Quận/huyện không được để trống")
        Integer quan,

        @NotNull(message = "Tỉnh/thành phố không được để trống")
        Integer province,

        @NotNull(message = "Phường/xã không được để trống")
        Integer phuongxa,

        @NotNull(message = "Trạng thái không được để trống")
        String status
) {}
