package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.dto.request.VoucherRequest;
import com.team4tech.evbatteryswap.dto.response.VoucherResponse;
import com.team4tech.evbatteryswap.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IVoucherService {
    VoucherResponse createVoucher(VoucherRequest request);
    VoucherResponse updateVoucher(int id, VoucherRequest request);
    void deleteVoucher(int id);
    VoucherResponse getVoucherById(int id);
    VoucherResponse getVoucherByCode(String code);
    Page<VoucherResponse> getAllVouchers(Pageable pageable);
    
    // For internal logic
    Voucher validateAndGetVoucher(String code);
    void incrementUseCount(Voucher voucher);
}
