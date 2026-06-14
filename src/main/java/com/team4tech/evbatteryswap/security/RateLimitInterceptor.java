package com.team4tech.evbatteryswap.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.ratelimit.capacity:100}")
    private int globalCapacity;

    @Value("${app.ratelimit.minutes:1}")
    private int globalMinutes;

    private final Cache<String, Bucket> cache = Caffeine.newBuilder()
            .maximumSize(10000)
            .expireAfterAccess(5, TimeUnit.MINUTES)
            .build();

    private Bucket createNewBucket(int capacity, int minutes) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(capacity, Duration.ofMinutes(minutes))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Chỉ xử lý các request map vào một Method cụ thể trong Controller
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        String baseIdentifier = getClientIdentifier(request);

        String cacheKey = baseIdentifier + ":GLOBAL";
        int capacity = globalCapacity;
        int minutes = globalMinutes;

        // Nếu API có cấu hình Rate Limit riêng
        ApiRateLimit apiRateLimit = handlerMethod.getMethodAnnotation(ApiRateLimit.class);
        if (apiRateLimit != null) {
            capacity = apiRateLimit.capacity();
            minutes = apiRateLimit.minutes();
            String methodName = handlerMethod.getMethod().getName();
            cacheKey = baseIdentifier + ":API:" + methodName;
        }

        int finalCapacity = capacity;
        int finalMinutes = minutes;
        Bucket bucket = cache.get(cacheKey, k -> createNewBucket(finalCapacity, finalMinutes));

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            response.addHeader("X-RateLimit-Limit", String.valueOf(capacity));
            response.addHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
            return true;
        }

        log.warn("Rate limit exceeded for cacheKey: {}", cacheKey);
        
        long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
        response.addHeader("X-RateLimit-Limit", String.valueOf(capacity));
        response.addHeader("X-RateLimit-Remaining", "0");
        response.addHeader("X-RateLimit-Retry-After", String.valueOf(waitForRefill));
        
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> errorDetails = new LinkedHashMap<>();
        errorDetails.put("timestamp", Instant.now().toString());
        errorDetails.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
        errorDetails.put("error", "Too Many Requests");
        errorDetails.put("message", "Rate limit exceeded. Please try again in " + waitForRefill + " seconds.");
        errorDetails.put("path", request.getRequestURI());

        response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
        
        return false;
    }

    private String getClientIdentifier(HttpServletRequest request) {
        String token = jwtAuthenticationFilter.extractJwtFromRequest(request);
        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            return jwtTokenProvider.getUsernameFromToken(token);
        }
        
        String deviceId = request.getHeader("X-Device-Id");
        if (StringUtils.hasText(deviceId)) {
            return "DEVICE:" + deviceId;
        }

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return "IP:" + ip;
    }
}
