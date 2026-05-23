package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.entity.Phuongxa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhuongxaRepository extends JpaRepository<Phuongxa, Integer> {
    List<Phuongxa> findByQuanhuyenId(Integer quanhuyenId);
}
