package com.team4tech.evbatteryswap.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BatteryRequest(

        @NotBlank(message = "Số serial không được để trống")
        @Size(max = 100, message = "Số serial không được vượt quá 100 ký tự")
        String serialNumber,

        @NotBlank(message = "Model không được để trống")
        @Size(max = 100, message = "Model không được vượt quá 100 ký tự")
        String model,

        @NotNull(message = "Dung lượng (kWh) không được để trống")
        @DecimalMin(value = "0.0", inclusive = false, message = "Dung lượng phải lớn hơn 0")
        BigDecimal capacityKwh,

        @DecimalMin(value = "0.00", message = "Phần trăm sạc không được âm")
        @DecimalMax(value = "100.00", message = "Phần trăm sạc không được vượt quá 100")
        BigDecimal currentChargePercentage,

        @DecimalMin(value = "0.00", message = "Phần trăm sức khỏe không được âm")
        @DecimalMax(value = "100.00", message = "Phần trăm sức khỏe không được vượt quá 100")
        BigDecimal healthPercentage,

        Integer chargeCycles,

        @Size(max = 255, message = "Trạng thái không được vượt quá 255 ký tự")
        String status,

        BigDecimal amount,

        /** ID của trạm hiện tại (nullable) */
        Integer currentStationId,

        /** ID của người dùng được gán pin (nullable) */
        Integer userId,

        LocalDate manufactureDate
) {}
