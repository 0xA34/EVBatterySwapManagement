package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.StationRequest;
import com.team4tech.evbatteryswap.entity.Phuongxa;
import com.team4tech.evbatteryswap.entity.Quanhuyen;
import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.entity.Tinhthanh;
import com.team4tech.evbatteryswap.repository.StationRepository;
import com.team4tech.evbatteryswap.service.interfaces.IStationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StationService implements IStationService {

    private final StationRepository stationRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<Station> findAll(Pageable pageable) {
        return stationRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Station> findStations(
            @Param("status") String status,
            @Param("quan") Integer quan,
            @Param("province") Integer province,
            @Param("phuongxa") Integer phuongxa,
            Pageable pageable
    ) {
        return stationRepository.findStations(status, quan, province, phuongxa, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Station> findById(int id) {
        return stationRepository.findById(id);
    }

    @Override
    @Transactional
    public Station createStation(StationRequest request) {
        Station station = new Station();
        station.setName(request.name());
        station.setAddress(request.address());
        station.setStatus(request.status());

        if (request.quan() != null) {
            Quanhuyen q = new Quanhuyen();
            q.setId(request.quan());
            station.setQuan(q);
        }
        if (request.province() != null) {
            Tinhthanh t = new Tinhthanh();
            t.setId(request.province());
            station.setProvince(t);
        }
        if (request.phuongxa() != null) {
            Phuongxa p = new Phuongxa();
            p.setId(request.phuongxa());
            station.setPhuongxa(p);
        }

        station.setCreatedAt(Instant.now());
        station.setUpdatedAt(Instant.now());

        return stationRepository.save(station);
    }

    @Override
    @Transactional
    public Station updateStation(int id, StationRequest request) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Station not found with id: " + id));

        station.setName(request.name());
        station.setAddress(request.address());
        station.setStatus(request.status());

        if (request.quan() != null) {
            Quanhuyen q = new Quanhuyen();
            q.setId(request.quan());
            station.setQuan(q);
        } else {
            station.setQuan(null);
        }

        if (request.province() != null) {
            Tinhthanh t = new Tinhthanh();
            t.setId(request.province());
            station.setProvince(t);
        } else {
            station.setProvince(null);
        }

        if (request.phuongxa() != null) {
            Phuongxa p = new Phuongxa();
            p.setId(request.phuongxa());
            station.setPhuongxa(p);
        } else {
            station.setPhuongxa(null);
        }

        station.setUpdatedAt(Instant.now());

        return stationRepository.save(station);
    }

    @Override
    @Transactional
    public void deleteStation(int id) {
        if (!stationRepository.existsById(id)) {
            throw new EntityNotFoundException("Station not found with id: " + id);
        }
        stationRepository.deleteById(id);
    }
}
