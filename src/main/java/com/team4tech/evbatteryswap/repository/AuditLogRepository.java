package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {
}
