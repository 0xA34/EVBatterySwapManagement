package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.entity.RefreshToken;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.repository.RefreshTokenRepository;
import com.team4tech.evbatteryswap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Transactional
    public RefreshToken createRefreshToken(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Revoke all existing tokens for this user
        refreshTokenRepository.revokeAllUserTokens(user);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setCreatedAt(Instant.now());
        refreshToken.setRevoked(false);

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getRevoked()) {
            throw new RuntimeException(token.getToken() + " Refresh token was revoked. Please make a new signin request");
        }
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException(token.getToken() + " Refresh token was expired. Please make a new signin request");
        }
        return token;
    }
    
    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.revokeToken(token);
    }
}
