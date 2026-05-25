package com.team4tech.evbatteryswap.repository;

import com.team4tech.evbatteryswap.entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Integer> {

    Page<SupportTicket> findByUserId(Integer userId, Pageable pageable);



}
