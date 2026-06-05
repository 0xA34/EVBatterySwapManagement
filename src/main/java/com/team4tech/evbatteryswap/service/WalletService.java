package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.TopUpRequest;
import com.team4tech.evbatteryswap.dto.response.TransactionResponse;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.entity.WalletTransaction;
import com.team4tech.evbatteryswap.entity.enums.TransactionType;
import com.team4tech.evbatteryswap.repository.UserRepository;
import com.team4tech.evbatteryswap.repository.WalletTransactionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final UserRepository userRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Transactional
    public TransactionResponse manualTopUp(Integer adminOrStaffId, TopUpRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id " + request.userId()));

        User performedBy = userRepository.findById(adminOrStaffId)
                .orElseThrow(() -> new EntityNotFoundException("Admin/Staff not found"));

        if (user.getWalletBalance() == null) {
            user.setWalletBalance(BigDecimal.ZERO);
        }

        user.setWalletBalance(user.getWalletBalance().add(request.amount()));
        userRepository.save(user);

        WalletTransaction transaction = new WalletTransaction();
        transaction.setUser(user);
        transaction.setAmount(request.amount());
        transaction.setType(TransactionType.MANUAL_TOP_UP);
        transaction.setPerformedBy(performedBy);
        transaction.setDescription(request.description());

        WalletTransaction savedTransaction = walletTransactionRepository.save(transaction);

        return new TransactionResponse(
                savedTransaction.getId(),
                user.getId(),
                savedTransaction.getAmount(),
                savedTransaction.getType(),
                savedTransaction.getDescription(),
                savedTransaction.getCreatedAt(),
                user.getWalletBalance()
        );
    }
}
