package com.team4tech.evbatteryswap.repository;

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

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findById(int id);
    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);


    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.email)    LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<User> filterByKeyword(@Param("keyword") String keyword, Pageable pageable);


    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.email = :newEmail WHERE u.id = :id")
    int updateEmail(@Param("id") int id, @Param("newEmail") String newEmail);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.phoneNumber = :newPhone WHERE u.id = :id")
    int updatePhone(@Param("id") int id, @Param("newPhone") String newPhone);


}