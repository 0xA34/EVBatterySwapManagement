package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.VoucherRequest;
import com.team4tech.evbatteryswap.dto.response.VoucherResponse;
import com.team4tech.evbatteryswap.entity.Voucher;
import com.team4tech.evbatteryswap.repository.VoucherRepository;
import com.team4tech.evbatteryswap.service.interfaces.IVoucherService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class VoucherService implements IVoucherService {

    private final VoucherRepository voucherRepository;

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request) {
        if (voucherRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Mã voucher đã tồn tại: " + request.getCode());
        }

        Voucher voucher = new Voucher();
        mapRequestToEntity(request, voucher);
        return VoucherResponse.from(voucherRepository.save(voucher));
    }

    @Override
    @Transactional
    public VoucherResponse updateVoucher(int id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy voucher với id " + id));

        // Check if code changed and if it already exists
        if (!voucher.getCode().equals(request.getCode()) && voucherRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Mã voucher đã tồn tại: " + request.getCode());
        }

        mapRequestToEntity(request, voucher);
        return VoucherResponse.from(voucherRepository.save(voucher));
    }

    @Override
    @Transactional
    public void deleteVoucher(int id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy voucher với id " + id));
        voucherRepository.delete(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherById(int id) {
        return voucherRepository.findById(id)
                .map(VoucherResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy voucher với id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherByCode(String code) {
        return voucherRepository.findByCode(code)
                .map(VoucherResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy voucher: " + code));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VoucherResponse> getAllVouchers(Pageable pageable) {
        return voucherRepository.findAll(pageable).map(VoucherResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public Voucher validateAndGetVoucher(String code) {
        if (code == null || code.trim().isEmpty()) {
            return null;
        }

        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Mã giảm giá không hợp lệ: " + code));

        if (!"ACTIVE".equalsIgnoreCase(voucher.getStatus())) {
            throw new IllegalArgumentException("Mã giảm giá không hoạt động.");
        }

        Instant now = Instant.now();
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            throw new IllegalArgumentException("Mã giảm giá chưa đến ngày sử dụng.");
        }

        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            throw new IllegalArgumentException("Mã giảm giá đã hết hạn.");
        }

        if (voucher.getUseCount() >= voucher.getLimitUsage()) {
            throw new IllegalArgumentException("Mã giảm giá đã hết lượt sử dụng.");
        }

        return voucher;
    }

    @Override
    @Transactional
    public void incrementUseCount(Voucher voucher) {
        voucher.setUseCount(voucher.getUseCount() + 1);
        voucherRepository.save(voucher);
    }

    private void mapRequestToEntity(VoucherRequest request, Voucher voucher) {
        voucher.setCode(request.getCode());
        voucher.setDescription(request.getDescription());
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setLimitUsage(request.getLimitUsage());
        voucher.setMinOrderValue(request.getMinOrderValue());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setStatus(request.getStatus());
    }
}
