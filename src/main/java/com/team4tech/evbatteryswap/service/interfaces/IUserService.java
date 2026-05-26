package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.dto.request.UserOnChangeRequest;
import com.team4tech.evbatteryswap.dto.request.UserRegisterRequest;
import com.team4tech.evbatteryswap.dto.response.UserStatusCountResponse;
import com.team4tech.evbatteryswap.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IUserService {

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findById(int id);
    Page<User> searchAndFilterUsers(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("role") String role,
            Pageable pageable
    );

    List<UserStatusCountResponse> countUsersByStatus();

    Page<User> searchByUsername(String username, Pageable pageable);

    User createUser(UserRegisterRequest request);
    User updateUser(int id, UserOnChangeRequest request);
    void deleteUser(int id);

    boolean updateEmail(@Param("id") int id, @Param("newEmail") String newEmail);
    boolean updatePhone(@Param("id") int id, @Param("newPhone") String newPhone);
    boolean updatePasswordById(@Param("id") int id, @Param("password") String newPassword);
    Optional<String> findPasswordById(@Param("id") int id);
}
