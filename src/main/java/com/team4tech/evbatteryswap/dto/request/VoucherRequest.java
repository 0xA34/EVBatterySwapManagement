package com.team4tech.evbatteryswap.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class VoucherRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    private String code;

    private String description;

    @NotBlank(message = "Loại giảm giá không được để trống (FIXED_AMOUNT hoặc PERCENTAGE)")
    private String discountType;

    @NotNull(message = "Giá trị giảm giá không được để trống")
    @Min(value = 0, message = "Giá trị giảm giá phải lớn hơn hoặc bằng 0")
    private BigDecimal discountValue;

    @NotNull(message = "Giới hạn sử dụng không được để trống")
    @Min(value = 1, message = "Giới hạn sử dụng phải ít nhất là 1")
    private Integer limitUsage;

    private BigDecimal minOrderValue;

    private Instant startDate;

    private Instant endDate;

    @NotBlank(message = "Trạng thái không được để trống")
    private String status;
}
