package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.entity.BatteryLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BatteryLogRepository extends JpaRepository<BatteryLog, Long> {

    /** Toàn bộ lịch sử của một pin, mới nhất trước. */
    Page<BatteryLog> findByBatteryIdOrderByCalculatedAtDesc(Integer batteryId, Pageable pageable);

    /** Bản ghi SoH mới nhất của một pin. */
    Optional<BatteryLog> findTopByBatteryIdOrderByCalculatedAtDesc(Integer batteryId);
}
