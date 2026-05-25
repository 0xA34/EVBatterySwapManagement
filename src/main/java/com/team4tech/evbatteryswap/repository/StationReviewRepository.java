package com.team4tech.evbatteryswap.repository;


import com.team4tech.evbatteryswap.entity.StationReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StationReviewRepository extends JpaRepository<StationReview, Integer> {

    Page<StationReview> findByUserId(Integer userId, Pageable pageable);

}
