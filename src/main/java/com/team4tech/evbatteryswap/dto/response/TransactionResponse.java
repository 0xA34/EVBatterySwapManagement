package com.team4tech.evbatteryswap.dto.response;

import com.team4tech.evbatteryswap.entity.enums.TransactionType;
import java.math.BigDecimal;
import java.time.Instant;

public record TransactionResponse(
        Integer transactionId,
        Integer userId,
        BigDecimal amount,
        TransactionType type,
        String description,
        Instant createdAt,
        BigDecimal newWalletBalance
) {
}
