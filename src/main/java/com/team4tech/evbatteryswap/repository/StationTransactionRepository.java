package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.entity.StationTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StationTransactionRepository extends JpaRepository<StationTransaction, Integer> {
    Page<StationTransaction> findByStationId(Integer stationId, Pageable pageable);
}
