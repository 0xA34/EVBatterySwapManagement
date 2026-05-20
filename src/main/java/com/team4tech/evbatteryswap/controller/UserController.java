package com.team4tech.evbatteryswap.controller;


import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/email")
    public ResponseEntity<Optional<User>> findByEmail(@RequestParam String email)
    {
        Optional<User> user = userService.findByEmail(email);
        return ResponseEntity.ok(user);
    }




}
