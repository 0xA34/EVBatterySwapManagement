package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.response.StationTransactionResponse;
import com.team4tech.evbatteryswap.entity.BatterySwapOrder;
import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.entity.StationTransaction;
import com.team4tech.evbatteryswap.repository.StationTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class StationTransactionService {

    private final StationTransactionRepository repository;

    @Transactional
    public void recordTransaction(Station station, BatterySwapOrder order, BigDecimal amount, String type, String description) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        StationTransaction transaction = new StationTransaction();
        transaction.setStation(station);
        transaction.setOrder(order);
        transaction.setAmount(amount);
        transaction.setType(type);
        transaction.setDescription(description);

        repository.save(transaction);
        log.info("[StationTransaction] Recorded {} of {} for station '{}' (Order: {})",
                type, amount, station.getName(), (order != null ? order.getId() : "none"));
    }

    @Transactional(readOnly = true)
    public Page<StationTransactionResponse> getStationHistory(Integer stationId, Pageable pageable) {
        return repository.findByStationId(stationId, pageable)
                .map(StationTransactionResponse::from);
    }
}
