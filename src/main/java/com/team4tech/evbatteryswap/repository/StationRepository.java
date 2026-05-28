package com.team4tech.evbatteryswap.repository;


import com.team4tech.evbatteryswap.dto.response.StationStatusCountResponse;
import com.team4tech.evbatteryswap.entity.Station;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StationRepository extends JpaRepository<Station, Integer> {


    Optional<Station> findById(Integer id);

    @Query("SELECT s FROM Station s WHERE " +
            "(CAST(:keyword AS string) IS NULL OR " +
            " LOWER(s.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
            " LOWER(s.address) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) AND " +
            "(:status IS NULL OR s.status = :status) AND " +
            "(:quan IS NULL OR s.quan.id = :quan) AND " +
            "(:province IS NULL OR s.province.id = :province) AND " +
            "(:phuongxa IS NULL OR s.phuongxa.id = :phuongxa)")

    Page<Station> findStationsWithKeyword(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("quan") Integer quan,
            @Param("province") Integer province,
            @Param("phuongxa") Integer phuongxa,
            Pageable pageable
    );

    @Query("SELECT new com.team4tech.evbatteryswap.dto.response.StationStatusCountResponse(s.status, COUNT(s)) " +
            "FROM Station s GROUP BY s.status")
    List<StationStatusCountResponse> countStationsByStatus();




}
