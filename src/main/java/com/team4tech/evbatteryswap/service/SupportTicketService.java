package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.SupportTicketRequest;
import com.team4tech.evbatteryswap.entity.SupportTicket;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.repository.SupportTicketRepository;
import com.team4tech.evbatteryswap.repository.UserRepository;
import com.team4tech.evbatteryswap.service.interfaces.ISupportTicketService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SupportTicketService implements ISupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<SupportTicket> findByUserId(Integer userId, Pageable pageable) {
        return supportTicketRepository.findByUserId(userId, pageable);
    }


    @Override
    @Transactional
    public Optional<SupportTicket> createSupportTicket(int userId, SupportTicketRequest supportTicketRequest) {
        SupportTicket supportTicket = new SupportTicket();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        supportTicket.setUser(user);
        supportTicket.setSubject(supportTicketRequest.subject());
        supportTicket.setMessage(supportTicketRequest.message());
        supportTicket.setStatus("OPEN");
        supportTicket.setPriority("MEDIUM");
        supportTicket.setCreatedAt(Instant.now());
        supportTicket.setUpdatedAt(Instant.now());
        // SỬA Ở ĐÂY: Bọc đối tượng đã save vào Optional
        SupportTicket savedTicket = supportTicketRepository.save(supportTicket);
        return Optional.of(savedTicket);
    }

}
