package com.team4tech.evbatteryswap.repository;


import com.team4tech.evbatteryswap.entity.Station;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StationRepository extends JpaRepository<Station, Integer> {
    Page<Station> findAll(Pageable pageable);

    @Query("SELECT s FROM Station s WHERE " +
            "(:status IS NULL OR s.status = :status) AND " +
            "(:quan IS NULL OR s.quan.id = :quan) AND " +
            "(:province IS NULL OR s.province.id = :province) AND " +
            "(:phuongxa IS NULL OR s.phuongxa.id = :phuongxa)")
    Page<Station> findStations(
            @Param("status") String status,
            @Param("quan") Integer quan,
            @Param("province") Integer province,
            @Param("phuongxa") Integer phuongxa,
            Pageable pageable
    );


    @Query("SELECT s FROM Station s WHERE " +
            "LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Station> searchByKeyword(
            @Param("keyword") String keyword,
            Pageable pageable
    );

//    Optional<Station> findByName(String name);
//    Page<Station> findByStatus(String status, Pageable pageable);
}
