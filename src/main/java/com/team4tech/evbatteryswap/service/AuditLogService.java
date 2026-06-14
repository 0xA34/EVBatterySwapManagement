package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.entity.AuditLog;
import com.team4tech.evbatteryswap.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void logAction(String action, String username, String details, String ipAddress) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setUsername(username);
        auditLog.setDetails(details);
        auditLog.setIpAddress(ipAddress);
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);
    }
}
