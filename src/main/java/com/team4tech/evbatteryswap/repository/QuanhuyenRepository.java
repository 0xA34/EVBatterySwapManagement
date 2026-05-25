package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.entity.Quanhuyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuanhuyenRepository extends JpaRepository<Quanhuyen, Integer> {

    List<Quanhuyen> findByTinhthanhId(Integer tinhthanhId);
}
