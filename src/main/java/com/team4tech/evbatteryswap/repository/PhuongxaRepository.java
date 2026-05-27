package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.dto.response.WardStationCountResponse;
import com.team4tech.evbatteryswap.entity.Phuongxa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhuongxaRepository extends JpaRepository<Phuongxa, Integer> {
    List<Phuongxa> findByQuanhuyenId(Integer quanhuyenId);


    // Hàm mới: Lấy danh sách phường xã kèm số lượng trạm theo ID Quận Huyện
    @Query("SELECT new com.team4tech.evbatteryswap.dto.response.WardStationCountResponse(" +
            "p.id, p.tenphuongxa, COUNT(s.id)) " +
            "FROM Phuongxa p " +
            "LEFT JOIN Station s ON s.phuongxa.id = p.id " +
            "WHERE p.quanhuyen.id = :quanhuyenId " +
            "GROUP BY p.id, p.tenphuongxa")
    List<WardStationCountResponse> findWardCountsByDistrictId(@Param("quanhuyenId") Integer quanhuyenId);

}
