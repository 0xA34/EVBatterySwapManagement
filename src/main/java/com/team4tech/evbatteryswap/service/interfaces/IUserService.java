package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.entity.User;

import java.util.Optional;

public interface IUserService {

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findById(int id);

}
