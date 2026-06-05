package com.team4tech.evbatteryswap.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TopUpRequest(
        @NotNull(message = "ID của người dùng không được để trống.")
        Integer userId,

        @NotNull(message = "Số tiền không được để trống.")
        @DecimalMin(value = "1.0", message = "Số tiền phải lớn hơn 0.")
        @DecimalMax(value = "5000000.0", message = "Số tiền tối đa cho một lần cộng là 5,000,000 VND.")
        BigDecimal amount,

        String description
) {
}
