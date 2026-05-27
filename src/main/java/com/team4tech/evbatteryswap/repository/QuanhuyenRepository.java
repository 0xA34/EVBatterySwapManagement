package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.dto.response.DistrictStationCountResponse;
import com.team4tech.evbatteryswap.entity.Quanhuyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuanhuyenRepository extends JpaRepository<Quanhuyen, Integer> {

    List<Quanhuyen> findByTinhthanhId(Integer tinhthanhId);

    @Query("SELECT new com.team4tech.evbatteryswap.dto.response.DistrictStationCountResponse(" +
            "q.id, q.tenquanhuyen, COUNT(s.id)) " +
            "FROM Quanhuyen q " +
            "LEFT JOIN Station s ON s.quan.id = q.id " +
            "WHERE q.tinhthanh.id = :tinhthanhId " +
            "GROUP BY q.id, q.tenquanhuyen")
    List<DistrictStationCountResponse> findDistrictCountsByProvinceId(@Param("tinhthanhId") Integer tinhthanhId);


}
