package com.team4tech.evbatteryswap.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

/**
 * Request tài xế gửi lên khi muốn liên kết (thêm mới) pin vào tài khoản.
 *
 * @param serialNumber            Số serial pin, định dạng PIN-XXXXXX (6 ký tự chữ/số).
 * @param model                   Model pin theo dòng xe: Feliz-XXXXXX, Evo-XXXXXX, Vero-XXXXXX hoặc Drift-XXXXXX.
 * @param capacityKwh             Dung lượng pin tính bằng kWh (bắt buộc, phải &gt; 0).
 * @param currentChargePercentage Phần trăm sạc hiện tại (tùy chọn, mặc định 100).
 */
public record LinkBatteryRequest(

        @NotBlank(message = "Số serial không được để trống")
        @Pattern(regexp = "^PIN-[A-Za-z0-9]{6}$",
                 message = "Số serial phải có định dạng PIN-XXXXXX (6 ký tự chữ hoặc số)")
        String serialNumber,

        @NotBlank(message = "Model không được để trống")
        @Pattern(regexp = "^(Feliz|Evo|Vero|Drift)-[A-Za-z0-9]{6}$",
                 message = "Model phải bắt đầu bằng Feliz, Evo, Vero hoặc Drift, theo sau bởi '-' và 6 ký tự (VD: Feliz-6TYUI1)")
        String model,

        @DecimalMin(value = "0.0", inclusive = false, message = "Dung lượng phải lớn hơn 0")
        BigDecimal capacityKwh,

        @DecimalMin(value = "0.00", message = "Phần trăm sạc không được âm")
        @DecimalMax(value = "100.00", message = "Phần trăm sạc không được vượt quá 100")
        BigDecimal currentChargePercentage

) {
    public BigDecimal effectiveChargePercentage() {
        return currentChargePercentage != null ? currentChargePercentage : new BigDecimal("100.00");
    }

    public BigDecimal effectiveCapacityKwh() {
        return capacityKwh != null ? capacityKwh : new BigDecimal("2.5");
    }
}
