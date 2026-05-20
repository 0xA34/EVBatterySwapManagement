package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.repository.UserRepository;
import com.team4tech.evbatteryswap.service.interfaces.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService implements IUserService {

    @Autowired
    private UserRepository userRepository;


    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    };

    public Optional<User> findById(int id) {
        return userRepository.findById(id);
    };

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    };
}
