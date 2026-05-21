package com.team4tech.evbatteryswap.controller;


import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.service.StationService;
import com.team4tech.evbatteryswap.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final StationService stationService;

    @GetMapping("/email")
    public ResponseEntity<Optional<User>> findByEmail(@RequestParam String email)
    {
        Optional<User> user = userService.findByEmail(email);
        return ResponseEntity.ok(user);
    }




}
