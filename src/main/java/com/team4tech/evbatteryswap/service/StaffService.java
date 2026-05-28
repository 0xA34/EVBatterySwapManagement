package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.CreateStaffRequest;
import com.team4tech.evbatteryswap.dto.request.UserOnChangeRequest;
import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.repository.StationRepository;
import com.team4tech.evbatteryswap.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final UserRepository userRepository;
    private final StationRepository stationRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Tim kiem danh sach staff co phan trang, ho tro filter theo keyword va status.
     */
    @Transactional(readOnly = true)
    public Page<User> searchStaffs(String keyword, String status, Pageable pageable) {
        return userRepository.searchStaffs(keyword, status, pageable);
    }

    /**
     * Lay thong tin chi tiet staff theo ID, bao gom danh sach stations.
     */
    @Transactional(readOnly = true)
    public User getStaffById(int id) {
        User user = userRepository.findByIdWithStations(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với id: " + id));
        if (!"STAFF".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("User với id " + id + " không phải là STAFF.");
        }
        return user;
    }

    /**
     * Tao staff moi, tu dong set role = STAFF, co the gan stations ngay khi tao.
     */
    @Transactional
    public User createStaff(CreateStaffRequest request) {
        // Kiem tra username trung
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new IllegalArgumentException("Username '" + request.username() + "' đã tồn tại.");
        }
        // Kiem tra email trung
        if (request.email() != null && !request.email().isBlank()
                && userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email '" + request.email() + "' đã được sử dụng.");
        }

        User staff = new User();
        staff.setUsername(request.username());
        staff.setFullName(request.fullName());
        staff.setEmail(request.email());
        staff.setPhoneNumber(request.phoneNumber());
        staff.setPassword(passwordEncoder.encode(request.password()));
        staff.setRole("STAFF"); // luon la STAFF
        staff.setStatus(request.status() != null ? request.status() : "ACTIVE");
        staff.setCreatedAt(Instant.now());
        staff.setUpdatedAt(Instant.now());

        // Gan stations neu co
        if (request.stationIds() != null && !request.stationIds().isEmpty()) {
            List<Station> stations = stationRepository.findAllById(request.stationIds());
            if (stations.size() != request.stationIds().size()) {
                throw new IllegalArgumentException("Một hoặc nhiều station ID không tồn tại.");
            }
            staff.setStations(new ArrayList<>(stations));
        }

        return userRepository.save(staff);
    }

    /**
     * Cap nhat thong tin co ban cua staff (fullName, email, phone, password, status).
     * Khong thay doi role va stations.
     */
    @Transactional
    public User updateStaff(int id, UserOnChangeRequest request) {
        User staff = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với id: " + id));
        if (!"STAFF".equalsIgnoreCase(staff.getRole())) {
            throw new IllegalArgumentException("User với id " + id + " không phải là STAFF.");
        }

        // Kiem tra email trung
        if (request.email() != null && !request.email().isBlank()) {
            userRepository.findByEmail(request.email())
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException("Email '" + request.email() + "' đã được sử dụng.");
                    });
        }

        staff.setFullName(request.fullName());
        staff.setEmail(request.email());
        staff.setPhoneNumber(request.phoneNumber());
        if (request.status() != null) staff.setStatus(request.status());

        // Chi cap nhat password neu duoc cung cap
        if (request.password() != null && !request.password().isBlank()) {
            staff.setPassword(passwordEncoder.encode(request.password()));
        }

        staff.setUpdatedAt(Instant.now());

        return userRepository.save(staff);
    }

    /**
     * Xoa staff.
     */
    @Transactional
    public void deleteStaff(int id) {
        User staff = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với id: " + id));
        if (!"STAFF".equalsIgnoreCase(staff.getRole())) {
            throw new IllegalArgumentException("User với id " + id + " không phải là STAFF.");
        }
        userRepository.deleteById(id);
    }

    /**
     * Thay the toan bo danh sach stations cua staff (PUT).
     */
    @Transactional
    public User replaceStations(int staffId, List<Integer> stationIds) {
        User staff = userRepository.findByIdWithStations(staffId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với id: " + staffId));
        if (!"STAFF".equalsIgnoreCase(staff.getRole())) {
            throw new IllegalArgumentException("User với id " + staffId + " không phải là STAFF.");
        }

        if (stationIds == null || stationIds.isEmpty()) {
            staff.getStations().clear();
        } else {
            List<Station> stations = stationRepository.findAllById(stationIds);
            if (stations.size() != stationIds.size()) {
                throw new IllegalArgumentException("Một hoặc nhiều station ID không tồn tại.");
            }
            staff.setStations(new ArrayList<>(stations));
        }

        staff.setUpdatedAt(Instant.now());
        return userRepository.save(staff);
    }

    /**
     * Gan them stations cho staff (POST - append).
     */
    @Transactional
    public User assignStations(int staffId, List<Integer> stationIds) {
        User staff = userRepository.findByIdWithStations(staffId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với id: " + staffId));
        if (!"STAFF".equalsIgnoreCase(staff.getRole())) {
            throw new IllegalArgumentException("User với id " + staffId + " không phải là STAFF.");
        }

        List<Station> newStations = stationRepository.findAllById(stationIds);
        if (newStations.size() != stationIds.size()) {
            throw new IllegalArgumentException("Một hoặc nhiều station ID không tồn tại.");
        }

        // Chi them nhung station chua co trong danh sach
        List<Integer> existingIds = staff.getStations().stream()
                .map(Station::getId)
                .toList();
        for (Station station : newStations) {
            if (!existingIds.contains(station.getId())) {
                staff.getStations().add(station);
            }
        }

        staff.setUpdatedAt(Instant.now());
        return userRepository.save(staff);
    }

    /**
     * Go stations khoi staff (DELETE).
     */
    @Transactional
    public User removeStations(int staffId, List<Integer> stationIds) {
        User staff = userRepository.findByIdWithStations(staffId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với id: " + staffId));
        if (!"STAFF".equalsIgnoreCase(staff.getRole())) {
            throw new IllegalArgumentException("User với id " + staffId + " không phải là STAFF.");
        }

        staff.getStations().removeIf(station -> stationIds.contains(station.getId()));

        staff.setUpdatedAt(Instant.now());
        return userRepository.save(staff);
    }

    /**
     * Lay danh sach staff dang quan ly mot station cu the.
     */
    @Transactional(readOnly = true)
    public List<User> getStaffsByStation(int stationId) {
        if (!stationRepository.existsById(stationId)) {
            throw new EntityNotFoundException("Không tìm thấy station với id: " + stationId);
        }
        return userRepository.findStaffsByStationId(stationId);
    }
}
