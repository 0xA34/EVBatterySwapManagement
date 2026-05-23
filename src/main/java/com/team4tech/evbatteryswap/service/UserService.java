package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.UserOnChangeRequest;
import com.team4tech.evbatteryswap.dto.request.UserRegisterRequest;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.repository.UserRepository;
import com.team4tech.evbatteryswap.service.interfaces.IUserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;


    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findById(int id) {
        return userRepository.findById(id);
    }


    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }


    @Override
    @Transactional(readOnly = true)
    public Page<User> filterByKeyword(@Param("keyword") String keyword, Pageable pageable) {
        return userRepository.filterByKeyword(keyword, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<User> searchByUsername(String username, Pageable pageable) {
        return userRepository.findByUsernameContainingIgnoreCase(username, pageable);
    }

    @Override
    @Transactional
    public User createUser(UserRegisterRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new IllegalArgumentException("Username '" + request.username() + "' already exists");
        }
        if (request.email() != null && !request.email().isBlank()
                && userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email '" + request.email() + "' already in use");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhoneNumber(request.phoneNumber());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role() != null ? request.role() : "DRIVER");
        user.setStatus(request.status() != null ? request.status() : "ACTIVE");
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUser(int id, UserOnChangeRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        // kiem tra email co trung khong?
        if (request.email() != null && !request.email().isBlank()) {
            userRepository.findByEmail(request.email())
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException("Email '" + request.email() + "' already in use");
                    });
        }

        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhoneNumber(request.phoneNumber());
        if (request.role() != null) user.setRole(request.role());
        if (request.status() != null) user.setStatus(request.status());

        // chi hash va cap nhat mat khau neu duoc cung cap
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        user.setUpdatedAt(Instant.now());

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(int id) {
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }


    @Override
    public boolean updateEmail(@Param("id") int id, @Param("newEmail") String newEmail) {
        int rowsAffected = userRepository.updateEmail(id, newEmail);
        return rowsAffected > 0;
    }

    @Override
    public boolean updatePhone(@Param("id") int id, @Param("newPhone") String newPhone) {
        int rowsAffected =  userRepository.updatePhone(id, newPhone);
        return rowsAffected > 0;
    }


    @Override
    public boolean updatePasswordById(@Param("id") int id, @Param("password") String newPassword) {
        int rowsAffected =  userRepository.updatePasswordById(id, newPassword);
        return rowsAffected > 0;
    }


    @Override
    @Transactional(readOnly = true)
    public Optional<String> findPasswordById(@Param("id") int id) {
        return userRepository.findPasswordById(id);
    }


}

