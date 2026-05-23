package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.entity.Quanhuyen;
import com.team4tech.evbatteryswap.repository.QuanhuyenRepository;
import com.team4tech.evbatteryswap.service.interfaces.IQuanhuyenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuanhuyenService implements IQuanhuyenService {
    private final QuanhuyenRepository quanhuyenRepository;

    @Transactional(readOnly = true)
    public List<Quanhuyen> findByTinhthanhId(Integer tinhthanhId) {
        return quanhuyenRepository.findByTinhthanhId(tinhthanhId);
    }
}
