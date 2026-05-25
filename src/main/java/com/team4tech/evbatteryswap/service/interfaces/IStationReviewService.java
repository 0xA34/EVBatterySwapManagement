package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.entity.StationReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IStationReviewService {

    Page<StationReview> findByUserId(Integer userId, Pageable pageable);
}
