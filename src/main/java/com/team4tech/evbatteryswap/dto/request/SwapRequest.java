package com.team4tech.evbatteryswap.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Request tài xế gửi lên khi muốn đổi pin.
 *
 * @param stationId       ID trạm tài xế đang đứng/muốn đổi.
 * @param minChargePercent Ngưỡng % sạc tối thiểu của pin mới (mặc định 80 nếu null).
 */
public record SwapRequest(

        @NotNull(message = "Phải chỉ định ID trạm")
        Integer stationId,

        @DecimalMin(value = "0",   message = "Ngưỡng sạc không được âm")
        @DecimalMax(value = "100", message = "Ngưỡng sạc không được vượt quá 100")
        BigDecimal minChargePercent,

        Integer batteryId

) {
    /** Trả về ngưỡng sạc tối thiểu — mặc định 80% nếu không truyền. */
    public BigDecimal effectiveMinCharge() {
        return minChargePercent != null ? minChargePercent : new BigDecimal("80");
    }
}
