package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.dto.response.TicketStatusCountResponse;
import com.team4tech.evbatteryswap.entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Integer> {

    Page<SupportTicket> findByUserId(Integer userId, Pageable pageable);

    @Query("SELECT t FROM SupportTicket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority)")
    Page<SupportTicket> searchAndFilter(@Param("status") String status, @Param("priority") String priority, Pageable pageable);

    // Đếm số lượng ticket ĐÃ CÓ admin_response (Thực sự có chữ bên trong)
    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.adminResponse IS NOT NULL AND TRIM(t.adminResponse) != ''")
    long countRespondedTickets();

    // Đếm số lượng ticket CHƯA CÓ admin_response (Bị NULL, Rỗng, hoặc chỉ chứa toàn dấu cách)
    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.adminResponse IS NULL OR TRIM(t.adminResponse) = ''")
    long countUnrespondedTickets();

    // Trả về danh sách đếm theo từng status có sẵn trong DB
    @Query("SELECT new com.team4tech.evbatteryswap.dto.response.TicketStatusCountResponse(t.status, COUNT(t)) " +
            "FROM SupportTicket t GROUP BY t.status")
    List<TicketStatusCountResponse> countTicketsGroupByStatus();

}
