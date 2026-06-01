package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.response.NotificationResponse;
import com.team4tech.evbatteryswap.entity.Battery;
import com.team4tech.evbatteryswap.entity.Notification;
import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.repository.NotificationRepository;
import com.team4tech.evbatteryswap.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Notification createAndSend(User user, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreatedAt(Instant.now());
        Notification saved = notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(
                user.getUsername(),
                "/queue/notifications",
                NotificationResponse.from(saved)
        );

        log.info("[Notification] Sent to user '{}': {} — {}", user.getUsername(), title, type);
        return saved;
    }

    public void notifyStationStatusChange(Station station, String oldStatus, String newStatus) {
        List<User> staffList = userRepository.findStaffsByStationId(station.getId());
        String title = "Trạm \"" + station.getName() + "\" đã đổi trạng thái";
        String message = "Trạm \"" + station.getName() + "\" tại " + station.getAddress()
                + " đã chuyển từ " + oldStatus + " sang " + newStatus + ".";

        for (User staff : staffList) {
            createAndSend(staff, title, message, "STATION_STATUS_CHANGE");
        }
    }

    public void notifyLowSoH(Battery battery, java.math.BigDecimal soh) {
        if (battery.getCurrentStation() == null) return;

        List<User> staffList = userRepository.findStaffsByStationId(battery.getCurrentStation().getId());
        String title = "Pin " + battery.getSerialNumber() + " có SoH thấp";
        String message = "Pin " + battery.getSerialNumber() + " (Model: " + battery.getModel()
                + ") hiện có SoH = " + soh + "%, đã dưới ngưỡng cho phép.";

        for (User staff : staffList) {
            createAndSend(staff, title, message, "BATTERY_LOW_SOH");
        }
    }

    public void notifyNewSupportTicket(String subject, String driverUsername) {
        List<User> admins = userRepository.searchAndFilterUsers(null, null, "ADMIN",
                Pageable.unpaged()).getContent();
        String title = "Có ticket hỗ trợ mới";
        String message = "Tài xế \"" + driverUsername + "\" đã gửi ticket: \"" + subject + "\".";

        for (User admin : admins) {
            createAndSend(admin, title, message, "NEW_SUPPORT_TICKET");
        }
    }

    @Transactional(readOnly = true)
    public Page<Notification> getNotifications(Integer userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Integer userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public Notification markAsRead(int notificationId, Integer userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(userId)) {
            throw new SecurityException("Access denied");
        }
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Integer userId) {
        Page<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, Pageable.unpaged());
        unread.getContent().stream()
                .filter(n -> !Boolean.TRUE.equals(n.getIsRead()))
                .forEach(n -> {
                    n.setIsRead(true);
                    notificationRepository.save(n);
                });
    }
}
