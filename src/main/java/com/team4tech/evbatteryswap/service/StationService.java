package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.StationRequest;
import com.team4tech.evbatteryswap.dto.response.*;
import com.team4tech.evbatteryswap.entity.Phuongxa;
import com.team4tech.evbatteryswap.entity.Quanhuyen;
import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.entity.Tinhthanh;
import com.team4tech.evbatteryswap.repository.BatteryRepository;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationService implements IStationService {

    private final StationRepository stationRepository;
    private final BatteryRepository batteryRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public Page<Station> findAll(Pageable pageable) {
        return stationRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Station> findStationsWithKeyword(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("quan") Integer quan,
            @Param("province") Integer province,
            @Param("phuongxa") Integer phuongxa,
            Pageable pageable) {
        return stationRepository.findStationsWithKeyword(keyword, status, quan, province, phuongxa, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StationHomeResponse> findStationsWithKeywordHome(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("quan") Integer quan,
            @Param("province") Integer province,
            @Param("phuongxa") Integer phuongxa,
            Pageable pageable) {
        // 1. Lấy danh sách trạm (phân trang bình thường)
        Page<Station> stationPage = stationRepository.findStationsWithKeyword(keyword, status, quan, province, phuongxa,
                pageable);

        // Nếu không có trạm nào thì trả về Page rỗng luôn
        if (stationPage.isEmpty()) {
            return Page.empty(pageable);
        }

        // 2. Lấy tất cả ID của các trạm trong trang hiện tại
        List<Integer> stationIds = stationPage.getContent().stream()
                .map(Station::getId)
                .collect(Collectors.toList());

        // 3. Gọi DB 1 LẦN DUY NHẤT để lấy số lượng pin của TẤT CẢ các trạm này
        List<Object[]> dbResults = batteryRepository.countBatteryStatusesByStationIds(stationIds);
        // 4. Nhóm kết quả trả về thành Map<StationId, Map<Status, Count>> để dễ tra cứu
        Map<Integer, Map<String, Long>> countMapByStation = new HashMap<>();
        for (Integer id : stationIds) {
            countMapByStation.put(id, new HashMap<>()); // Khởi tạo Map rỗng cho mỗi trạm
        }

        for (Object[] row : dbResults) {
            Integer sId = (Integer) row[0];
            String stat = (String) row[1];
            Long count = (Long) row[2];
            countMapByStation.get(sId).put(stat, count);
        }

        // 5. Các trạng thái bắt buộc phải hiển thị (giống logic bạn đã làm bên
        // BatteryService)
        List<String> allStatuses = Arrays.asList("AVAILABLE", "EMPTY", "RESERVED", "RENTED", "CHARGING");

        // 6. Map dữ liệu Station thành StationWithBatteryInfoResponse
        return stationPage.map(station -> {
            Map<String, Long> statusMap = countMapByStation.get(station.getId());
            List<BatteryStatusCountResponse> finalBatteryCounts = new ArrayList<>();

            for (String stat : allStatuses) {
                // Lấy số lượng, nếu không có thì mặc định là 0
                long count = statusMap.getOrDefault(stat, 0L);
                finalBatteryCounts.add(new BatteryStatusCountResponse(stat, count));
            }

            return new StationHomeResponse(station, finalBatteryCounts);
        });
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

        String oldStatus = station.getStatus();
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

        Station saved = stationRepository.save(station);

        if (!oldStatus.equals(request.status())) {
            notificationService.notifyStationStatusChange(saved, oldStatus, request.status());
        }

        return saved;
    }

    @Override
    @Transactional
    public Station updateStationStatus(int id, String status) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Station not found with id: " + id));

        String oldStatus = station.getStatus();
        station.setStatus(status);
        station.setUpdatedAt(Instant.now());
        Station saved = stationRepository.save(station);

        if (!oldStatus.equals(status)) {
            notificationService.notifyStationStatusChange(saved, oldStatus, status);
        }

        return saved;
    }

    @Override
    @Transactional
    public void deleteStation(int id) {
        if (!stationRepository.existsById(id)) {
            throw new EntityNotFoundException("Station not found with id: " + id);
        }
        stationRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StationStatusCountResponse> countStationsByStatus() {
        // 1. Lấy dữ liệu thực tế từ database (ví dụ chỉ có MAINTENANCE, ACTIVE,
        // INACTIVE)
        List<StationStatusCountResponse> dbResults = stationRepository.countStationsByStatus();

        // Chuyển danh sách từ DB thành Map để dễ tra cứu: Key là Status, Value là Count
        Map<String, Long> dbResultMap = dbResults.stream()
                .collect(Collectors.toMap(StationStatusCountResponse::getStatus, StationStatusCountResponse::getCount));

        // 2. Định nghĩa danh sách 4 trạng thái bắt buộc phải có
        List<String> allStatuses = Arrays.asList("ACTIVE", "MAINTENANCE", "DEPLOYING", "INACTIVE");

        // 3. Tạo danh sách kết quả cuối cùng
        List<StationStatusCountResponse> finalResults = new ArrayList<>();

        for (String status : allStatuses) {
            // Nếu DB có trạng thái này thì lấy số lượng từ DB, ngược lại thì gán bằng 0
            long count = dbResultMap.getOrDefault(status, 0L);
            finalResults.add(new StationStatusCountResponse(status, count));
        }

        return finalResults;
    }

}
