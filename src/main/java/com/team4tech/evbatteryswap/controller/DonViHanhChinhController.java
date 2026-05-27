package com.team4tech.evbatteryswap.controller;


import com.team4tech.evbatteryswap.dto.response.DistrictStationCountResponse;
import com.team4tech.evbatteryswap.dto.response.StationCountByProvinceResponse;
import com.team4tech.evbatteryswap.dto.response.WardStationCountResponse;
import com.team4tech.evbatteryswap.entity.Phuongxa;
import com.team4tech.evbatteryswap.entity.Quanhuyen;
import com.team4tech.evbatteryswap.entity.Tinhthanh;
import com.team4tech.evbatteryswap.service.PhuongxaService;
import com.team4tech.evbatteryswap.service.QuanhuyenService;
import com.team4tech.evbatteryswap.service.StationService;
import com.team4tech.evbatteryswap.service.TinhthanhService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/donvihanhchinh")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class DonViHanhChinhController {

    TinhthanhService tinhthanhService;
    QuanhuyenService quanhuyenService;
    PhuongxaService phuongxaService;

    @GetMapping("/tinhThanh")
    public ResponseEntity<List<Tinhthanh>> getTinhThanh() {
        return ResponseEntity.ok(tinhthanhService.getTinhthanh());
    }

    @GetMapping("/tinhThanhCount")
    public List<StationCountByProvinceResponse> getTinhThanhCount() {
        return tinhthanhService.countStationsByProvince();
    }

    @GetMapping("/quanHuyen")
    public ResponseEntity<List<Quanhuyen>> getQuanHuyen(@RequestParam Integer idTinhThanh) {
        return ResponseEntity.ok(quanhuyenService.findByTinhthanhId(idTinhThanh));
    }



    @GetMapping("/quanHuyenCount")
    public List<DistrictStationCountResponse> getQuanHuyenCount(@RequestParam Integer idTinhThanh) {
        return quanhuyenService.findDistrictCountsByProvinceId(idTinhThanh);
    }


    @GetMapping("/phuongXa")
    public ResponseEntity<List<Phuongxa>> getPhuongXa(@RequestParam Integer idQuanHuyen) {
        return ResponseEntity.ok(phuongxaService.findByQuanhuyenId(idQuanHuyen));
    }


    @GetMapping("/phuongXaCount")
    public List<WardStationCountResponse> getPhuongXaCount(@RequestParam Integer idQuanHuyen) {
        return phuongxaService.findWardCountsByDistrictId(idQuanHuyen);
    }

}
