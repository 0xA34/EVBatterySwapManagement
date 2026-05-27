package com.team4tech.evbatteryswap.repository;


import com.team4tech.evbatteryswap.dto.response.StationCountByProvinceResponse;
import com.team4tech.evbatteryswap.entity.Tinhthanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TinhthanhRepository extends JpaRepository<Tinhthanh, Integer> {
    List<Tinhthanh> findAll();

    @Query("SELECT new com.team4tech.evbatteryswap.dto.response.StationCountByProvinceResponse(" +
            "t.bienso, t.id, t.tinhthanhcol, COUNT(s.id)) " +
            "FROM Tinhthanh t " +
            "LEFT JOIN Station s ON s.province.id = t.id " +
            "GROUP BY t.id, t.bienso, t.tinhthanhcol")
    List<StationCountByProvinceResponse> countStationsByProvince();

}
