package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.entity.StationReview;
import com.team4tech.evbatteryswap.repository.StationReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StationReviewService {

    private final StationReviewRepository stationReviewRepository;

    public Page<StationReview> findByUserId(Integer userId, Pageable pageable) {
        return stationReviewRepository.findByUserId(userId, pageable);
    }

}
