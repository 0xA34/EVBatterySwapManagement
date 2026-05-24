package com.team4tech.evbatteryswap.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// In memory
@Service
public class TokenBlacklistService {

    private static final Logger logger = LoggerFactory.getLogger(TokenBlacklistService.class);

    // Map<token, expiryTimeMs>
    private final Map<String, Long> blacklist = new ConcurrentHashMap<>();

    public void blacklist(String token, long expiryMs) {
        blacklist.put(token, expiryMs);
        logger.debug("Token blacklisted, expires at epoch ms: {}", expiryMs);
    }

    public boolean isBlacklisted(String token) {
        return blacklist.containsKey(token);
    }

    // cron job de don tokens da het han sau 30 phut
    // cai nay de tranh tran memory
    @Scheduled(fixedDelay = 30 * 60 * 1000)
    public void evictExpiredTokens() {
        long now = new Date().getTime();
        int before = blacklist.size();
        blacklist.entrySet().removeIf(entry -> entry.getValue() <= now);
        int removed = before - blacklist.size();
        if (removed > 0) {
            logger.info("Evicted {} expired token(s) from blacklist", removed);
        }
    }
}
