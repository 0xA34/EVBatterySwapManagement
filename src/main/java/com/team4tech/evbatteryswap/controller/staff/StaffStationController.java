package com.team4tech.evbatteryswap.controller.staff;


import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.security.JwtAuthenticationFilter;
import com.team4tech.evbatteryswap.security.JwtTokenProvider;
import com.team4tech.evbatteryswap.service.StationService;
import com.team4tech.evbatteryswap.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/staff/stations")
@Tag(name = "Staff - Station Management")
@PreAuthorize("hasRole('STAFF')")
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class StaffStationController {

    StationService stationService;
    UserService userService;
    JwtAuthenticationFilter jwtAuthenticationFilter;
    JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public List<Station> findStationsByUserId(HttpServletRequest request) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        Integer userId = userService.findByUsername(username).get().getId();
        return userService.findStationsByUserId(userId);
    }


}
