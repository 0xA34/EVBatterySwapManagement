package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.entity.Battery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BatteryRepository extends JpaRepository<Battery, Integer> {

    boolean existsBySerialNumber(String serialNumber);

    boolean existsBySerialNumberAndIdNot(String serialNumber, Integer id);

    List<Battery> findByStatus(String status);

    @Query("SELECT b FROM Battery b JOIN FETCH b.user WHERE b.status = :status")
    List<Battery> findByStatusWithUser(String status);

    @Query("SELECT b FROM Battery b WHERE " +
            "(:status    IS NULL OR b.status = :status) AND " +
            "(:stationId IS NULL OR b.currentStation.id = :stationId) AND " +
            "(:userId    IS NULL OR b.user.id = :userId)")
    Page<Battery> findBatteries(
            @Param("status")    String  status,
            @Param("stationId") Integer stationId,
            @Param("userId")    Integer userId,
            Pageable pageable
    );

    @Query("SELECT b FROM Battery b WHERE " +
            "LOWER(b.serialNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.model)        LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.status)       LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Battery> searchByKeyword(
            @Param("keyword") String keyword,
            Pageable pageable
    );

    /**
     * Tìm pin hiện đang được gán cho tài xế (status = IN_USE, user.id = userId).
     * Mỗi tài xế chỉ có tối đa 1 pin IN_USE tại một thời điểm.
     */
    @Query("SELECT b FROM Battery b WHERE b.user.id = :userId AND b.status = 'IN_USE'")
    Optional<Battery> findCurrentBatteryOfUser(@Param("userId") Integer userId);

    /**
     * Tìm pin tốt nhất tại trạm để giao cho tài xế:
     * - status = AVAILABLE
     * - currentChargePercentage >= minCharge
     * - Ưu tiên healthPercentage cao nhất (pin khỏe nhất trước)
     */
    @Query("SELECT b FROM Battery b " +
            "WHERE b.currentStation.id = :stationId " +
            "  AND b.status = 'AVAILABLE' " +
            "  AND b.currentChargePercentage >= :minCharge " +
            "ORDER BY b.healthPercentage DESC")
    Page<Battery> findBestAvailableAtStation(
            @Param("stationId") Integer stationId,
            @Param("minCharge") BigDecimal minCharge,
            Pageable pageable
    );
}
