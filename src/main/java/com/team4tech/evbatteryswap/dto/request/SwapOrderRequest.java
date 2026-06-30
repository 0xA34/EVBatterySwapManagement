package com.team4tech.evbatteryswap.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class SwapOrderRequest {

    @NotNull(message = "Phải chỉ định ID trạm")
    private Integer stationId;

    private Integer batteryId;

    @DecimalMin(value = "0", message = "Ngưỡng sạc không được âm")
    @DecimalMax(value = "100", message = "Ngưỡng sạc không được vượt quá 100")
    private BigDecimal minChargePercent;

    private Instant scheduledAt;

    private String voucherCode;

    public BigDecimal effectiveMinCharge() {
        return minChargePercent != null ? minChargePercent : new BigDecimal("80");
    }
}
