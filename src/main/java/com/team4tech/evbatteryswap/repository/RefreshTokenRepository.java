package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.entity.RefreshToken;
import com.team4tech.evbatteryswap.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {
    Optional<RefreshToken> findByToken(String token);
    
    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user = :user")
    int revokeAllUserTokens(User user);
    
    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.token = :token")
    int revokeToken(String token);
}
