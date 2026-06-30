package com.team4tech.evbatteryswap.dto.response;

import com.team4tech.evbatteryswap.entity.Voucher;

import java.math.BigDecimal;
import java.time.Instant;

public record VoucherResponse(
        Integer id,
        String code,
        String description,
        String discountType,
        BigDecimal discountValue,
        Integer limitUsage,
        Integer useCount,
        BigDecimal minOrderValue,
        Instant startDate,
        Instant endDate,
        String status,
        Instant createdAt,
        Instant updatedAt
) {
    public static VoucherResponse from(Voucher v) {
        if (v == null) return null;
        return new VoucherResponse(
                v.getId(),
                v.getCode(),
                v.getDescription(),
                v.getDiscountType(),
                v.getDiscountValue(),
                v.getLimitUsage(),
                v.getUseCount(),
                v.getMinOrderValue(),
                v.getStartDate(),
                v.getEndDate(),
                v.getStatus(),
                v.getCreatedAt(),
                v.getUpdatedAt()
        );
    }
}
