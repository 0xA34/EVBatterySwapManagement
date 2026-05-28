package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.dto.response.UserRoleCountResponse;
import com.team4tech.evbatteryswap.dto.response.UserStatusCountResponse;
import com.team4tech.evbatteryswap.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findById(int id);
    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);


    @Query("SELECT u FROM User u WHERE " +
            "(CAST(:keyword AS string) IS NULL OR " +
            " LOWER(u.username) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
            " LOWER(u.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
            " LOWER(u.email)    LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) AND " +
            "(:status IS NULL OR u.status = :status) AND " +
            "(:role IS NULL OR u.role = :role)")
    Page<User> searchAndFilterUsers(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("role") String role,
            Pageable pageable
    );

    @Query("SELECT u.password FROM User u WHERE u.id = :id")
    Optional<String> findPasswordById(@Param("id") int id);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.email = :newEmail WHERE u.id = :id")
    int updateEmail(@Param("id") int id, @Param("newEmail") String newEmail);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.phoneNumber = :newPhone WHERE u.id = :id")
    int updatePhone(@Param("id") int id, @Param("newPhone") String newPhone);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.password = :password, u.updatedAt = CURRENT_TIMESTAMP WHERE u.id = :id")
    int updatePasswordById(@Param("id") int id, @Param("password") String password);

    @Query("SELECT new com.team4tech.evbatteryswap.dto.response.UserStatusCountResponse(u.status, COUNT(u)) " +
            "FROM User u GROUP BY u.status")
    List<UserStatusCountResponse> countUsersByStatus();


    @Query("SELECT new com.team4tech.evbatteryswap.dto.response.UserRoleCountResponse(u.role, COUNT(u)) " +
            "FROM User u GROUP BY u.role")
    List<UserRoleCountResponse> countUsersByRole();


    // ====== Staff Management Queries ======

    @Query("SELECT u FROM User u WHERE u.role = 'STAFF' AND " +
            "(CAST(:keyword AS string) IS NULL OR " +
            " LOWER(u.username) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
            " LOWER(u.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
            " LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) AND " +
            "(:status IS NULL OR u.status = :status)")
    Page<User> searchStaffs(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable
    );

    @Query("SELECT u FROM User u JOIN u.stations s WHERE u.role = 'STAFF' AND s.id = :stationId")
    List<User> findStaffsByStationId(@Param("stationId") Integer stationId);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.stations WHERE u.id = :id")
    Optional<User> findByIdWithStations(@Param("id") Integer id);

}