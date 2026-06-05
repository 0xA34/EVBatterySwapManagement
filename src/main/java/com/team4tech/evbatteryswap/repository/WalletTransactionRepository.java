package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Integer> {
    List<WalletTransaction> findByUserIdOrderByCreatedAtDesc(Integer userId);
}
