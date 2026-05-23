package com.team4tech.evbatteryswap.repository;


import com.team4tech.evbatteryswap.entity.Tinhthanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TinhthanhRepository extends JpaRepository<Tinhthanh, Integer> {
    List<Tinhthanh> findAll();

}
