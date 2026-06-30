package com.team4tech.evbatteryswap.dto.response;

import com.team4tech.evbatteryswap.entity.Station;

import java.time.Instant;

public record StationResponse(
        Integer id,
        String name,
        String address,
        Integer quanId,
        String quanName,
        Integer provinceId,
        String provinceName,
        Integer phuongxaId,
        String phuongxaName,
        String status,
        Double latitude,
        Double longitude,
        Instant createdAt,
        Instant updatedAt
) {
    public static StationResponse from(Station s) {
        return new StationResponse(
                s.getId(),
                s.getName(),
                s.getAddress(),
                s.getQuan()     != null ? s.getQuan().getId()            : null,
                s.getQuan()     != null ? s.getQuan().getTenquanhuyen()  : null,
                s.getProvince() != null ? s.getProvince().getId()        : null,
                s.getProvince() != null ? s.getProvince().getTinhthanhcol() : null,
                s.getPhuongxa() != null ? s.getPhuongxa().getId()        : null,
                s.getPhuongxa() != null ? s.getPhuongxa().getTenphuongxa() : null,
                s.getStatus(),
                s.getLatitude(),
                s.getLongitude(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}
