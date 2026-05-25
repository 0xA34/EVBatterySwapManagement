package com.team4tech.evbatteryswap.service.interfaces;

import com.team4tech.evbatteryswap.dto.request.SupportTicketRequest;
import com.team4tech.evbatteryswap.entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ISupportTicketService {

    Page<SupportTicket> findByUserId(Integer userId, Pageable pageable);
    Optional<SupportTicket> createSupportTicket(int userId, SupportTicketRequest supportTicketRequest);
}
