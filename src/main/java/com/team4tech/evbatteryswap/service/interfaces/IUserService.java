package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.dto.request.UserOnChangeRequest;
import com.team4tech.evbatteryswap.dto.request.UserRegisterRequest;
import com.team4tech.evbatteryswap.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface IUserService {

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findById(int id);
    Page<User> filterUsers(String search, Pageable pageable);
    Page<User> searchByUsername(String username, Pageable pageable);

    User createUser(UserRegisterRequest request);
    User updateUser(int id, UserOnChangeRequest request);
    void deleteUser(int id);
}
