package com.team4tech.evbatteryswap.service;
import com.team4tech.evbatteryswap.entity.Phuongxa;
import com.team4tech.evbatteryswap.repository.PhuongxaRepository;
import com.team4tech.evbatteryswap.service.interfaces.IPhuongxaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhuongxaService implements IPhuongxaService {
    private final PhuongxaRepository phuongxaRepository;

    public List<Phuongxa> findByQuanhuyenId(Integer quanhuyenId) {
        return phuongxaRepository.findByQuanhuyenId(quanhuyenId);
    }
}
