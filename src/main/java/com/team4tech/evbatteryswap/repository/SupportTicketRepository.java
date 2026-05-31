package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Integer> {

    Page<SupportTicket> findByUserId(Integer userId, Pageable pageable);

    @Query("SELECT t FROM SupportTicket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority)")
    Page<SupportTicket> searchAndFilter(@Param("status") String status, @Param("priority") String priority, Pageable pageable);

    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.adminResponse IS NOT NULL")
    long countRespondedTickets();

    // Đếm số lượng ticket CHƯA CÓ admin_response
    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.adminResponse IS NULL")
    long countUnrespondedTickets();

}
