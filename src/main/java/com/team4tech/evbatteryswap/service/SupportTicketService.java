package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.SupportTicketRequest;
import com.team4tech.evbatteryswap.dto.response.TicketStatusCountResponse;
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
import java.util.*;
import java.util.stream.Collectors;

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
    @Transactional(readOnly = true)
    public Optional<SupportTicket> findById(int id) {
        return supportTicketRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupportTicket> searchAndFilter(String status, String priority, Pageable pageable) {
        return supportTicketRepository.searchAndFilter(status, priority, pageable);
    }

    @Override
    @Transactional
    public SupportTicket updateTicket(int ticketId, com.team4tech.evbatteryswap.dto.request.UpdateSupportTicketRequest request) {
        SupportTicket supportTicket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Support ticket not found with id: " + ticketId));

        if (request.status() != null) supportTicket.setStatus(request.status());
        if (request.priority() != null) supportTicket.setPriority(request.priority());
        if (request.adminResponse() != null) supportTicket.setAdminResponse(request.adminResponse());
        
        supportTicket.setUpdatedAt(Instant.now());
        return supportTicketRepository.save(supportTicket);
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


    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getTicketStats() {
        long answeredCount = supportTicketRepository.countRespondedTickets();
        long noreplyCount = supportTicketRepository.countUnrespondedTickets();

        Map<String, Long> stats = new HashMap<>();
        stats.put("Answered", answeredCount);
        stats.put("Noreply", noreplyCount);
        return stats;
    }


    @Override
    @Transactional(readOnly = true)
    public List<TicketStatusCountResponse> countTicketsGroupByStatus() {
        // 1. Lấy dữ liệu thực tế từ database (ví dụ DB lúc này chỉ toàn ticket OPEN, chưa có ticket nào CLOSE)
        List<TicketStatusCountResponse> dbResults = supportTicketRepository.countTicketsGroupByStatus();

        // Chuyển danh sách từ DB thành Map để dễ tra cứu: Key là Status, Value là Count
        Map<String, Long> dbResultMap = dbResults.stream()
                .collect(Collectors.toMap(TicketStatusCountResponse::getStatus, TicketStatusCountResponse::getCount));

        // 2. Định nghĩa danh sách 2 trạng thái bắt buộc phải có
        List<String> allStatuses = Arrays.asList("OPEN", "CLOSE");

        // 3. Tạo danh sách kết quả cuối cùng
        List<TicketStatusCountResponse> finalResults = new ArrayList<>();

        for (String status : allStatuses) {
            // Nếu DB có trạng thái này thì lấy số lượng từ DB, ngược lại thì gán bằng 0
            long count = dbResultMap.getOrDefault(status, 0L);
            finalResults.add(new TicketStatusCountResponse(status, count));
        }
        return finalResults;
    }


}
