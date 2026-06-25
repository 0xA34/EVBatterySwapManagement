package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.entity.BatterySwapOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface BatterySwapOrderRepository extends JpaRepository<BatterySwapOrder, Integer> {

    @Query("SELECT o FROM BatterySwapOrder o WHERE o.driver.id = :driverId AND o.status IN ('PENDING', 'APPROVED')")
    Optional<BatterySwapOrder> findActiveOrderByDriver(@Param("driverId") Integer driverId);

    @Query("SELECT o FROM BatterySwapOrder o WHERE o.station.id = :stationId AND o.status IN ('PENDING', 'APPROVED') ORDER BY o.createdAt ASC")
    Page<BatterySwapOrder> findPendingOrdersByStation(@Param("stationId") Integer stationId, Pageable pageable);

    @Query("SELECT o FROM BatterySwapOrder o WHERE o.station.id IN :stationIds AND o.status IN ('PENDING', 'APPROVED') ORDER BY o.createdAt ASC")
    Page<BatterySwapOrder> findPendingOrdersByStationIds(@Param("stationIds") List<Integer> stationIds, Pageable pageable);

    @Query("SELECT o FROM BatterySwapOrder o WHERE o.driver.id = :driverId ORDER BY o.createdAt DESC")
    Page<BatterySwapOrder> findOrdersByDriver(@Param("driverId") Integer driverId, Pageable pageable);

    @Query("SELECT o FROM BatterySwapOrder o WHERE o.status = 'PENDING' AND o.orderType = 'BOOKING' AND o.expiresAt < :now")
    List<BatterySwapOrder> findExpiredBookings(@Param("now") Instant now);

    @Query("SELECT o FROM BatterySwapOrder o WHERE o.newBattery.id = :batteryId AND o.status IN ('PENDING', 'APPROVED')")
    Optional<BatterySwapOrder> findActiveOrderByBattery(@Param("batteryId") Integer batteryId);

    @Query("""
            SELECT o FROM BatterySwapOrder o
            WHERE o.station.id IN :stationIds
            AND (:status IS NULL OR o.status = :status)
            ORDER BY o.createdAt DESC
            """)
    Page<BatterySwapOrder> findOrdersByStationIds(
            @Param("stationIds") List<Integer> stationIds,
            @Param("status") String status,
            Pageable pageable);
}
