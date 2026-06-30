package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.SwapOrderRequest;
import com.team4tech.evbatteryswap.dto.response.SwapOrderResponse;
import com.team4tech.evbatteryswap.entity.Battery;
import com.team4tech.evbatteryswap.entity.BatterySwapOrder;
import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.repository.BatteryRepository;
import com.team4tech.evbatteryswap.repository.BatterySwapOrderRepository;
import com.team4tech.evbatteryswap.repository.StationRepository;
import com.team4tech.evbatteryswap.repository.UserRepository;
import com.team4tech.evbatteryswap.repository.WalletTransactionRepository;
import com.team4tech.evbatteryswap.service.interfaces.IVoucherService;
import com.team4tech.evbatteryswap.entity.WalletTransaction;
import com.team4tech.evbatteryswap.entity.enums.TransactionType;
import com.team4tech.evbatteryswap.entity.Voucher;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class SwapOrderService {

    private final BatterySwapOrderRepository orderRepository;
    private final BatteryRepository batteryRepository;
    private final StationRepository stationRepository;
    private final UserRepository userRepository;
    private final BatteryDiagnosticsService diagnosticsService;
    private final NotificationService notificationService;
    private final IVoucherService voucherService;
    private final WalletTransactionRepository walletTransactionRepository;
    private final StationTransactionService stationTransactionService;

    @Transactional
    public SwapOrderResponse createBooking(String username, SwapOrderRequest request) {
        User driver = findDriver(username);
        checkNoActiveOrder(driver);

        Instant now = Instant.now();
        Instant maxAllowed = now.plus(3, ChronoUnit.HOURS);
        Instant scheduledAt = request.getScheduledAt();

        if (scheduledAt != null) {
            if (scheduledAt.isBefore(now)) {
                throw new IllegalArgumentException("Thời gian đặt lịch không được ở trong quá khứ.");
            }
            if (scheduledAt.isAfter(maxAllowed)) {
                throw new IllegalArgumentException("Thời gian đặt lịch không được vượt quá 3 giờ kể từ bây giờ.");
            }
        } else {
            scheduledAt = maxAllowed;
        }

        Station station = findActiveStation(request.getStationId());
        Battery oldBattery = batteryRepository.findCurrentBatteryOfUser(driver.getId()).orElse(null);
        Battery newBattery = findBestBattery(station, request);

        newBattery.setStatus("RESERVED");
        batteryRepository.save(newBattery);

        BatterySwapOrder order = new BatterySwapOrder();
        order.setDriver(driver);
        order.setStation(station);
        order.setOldBattery(oldBattery);
        order.setNewBattery(newBattery);
        order.setOrderType("BOOKING");
        order.setStatus("PENDING");
        order.setScheduledAt(scheduledAt);
        order.setExpiresAt(scheduledAt);

        processPayment(order, request, driver);

        orderRepository.save(order);

        log.info("[Order] Driver '{}' created BOOKING #{} at station '{}', battery #{} RESERVED, scheduled={}",
                username, order.getId(), station.getName(), newBattery.getId(), scheduledAt);

        notifyStaffAtStation(station, driver, "BOOKING");

        return SwapOrderResponse.from(order);
    }

    @Transactional
    public SwapOrderResponse createDirectSwap(String username, SwapOrderRequest request) {
        User driver = findDriver(username);
        checkNoActiveOrder(driver);

        Station station = findActiveStation(request.getStationId());
        Battery oldBattery = batteryRepository.findCurrentBatteryOfUser(driver.getId())
                .orElseThrow(() -> new IllegalStateException("Tài xế chưa có pin IN_USE — không thể yêu cầu đổi."));
        Battery newBattery = findBestBattery(station, request);

        newBattery.setStatus("RESERVED");
        batteryRepository.save(newBattery);

        BatterySwapOrder order = new BatterySwapOrder();
        order.setDriver(driver);
        order.setStation(station);
        order.setOldBattery(oldBattery);
        order.setNewBattery(newBattery);
        order.setOrderType("DIRECT_SWAP");
        order.setStatus("PENDING");

        processPayment(order, request, driver);

        orderRepository.save(order);

        log.info("[Order] Driver '{}' created DIRECT_SWAP #{} at station '{}'",
                username, order.getId(), station.getName());

        notifyStaffAtStation(station, driver, "DIRECT_SWAP");

        return SwapOrderResponse.from(order);
    }

    @Transactional
    public SwapOrderResponse approveOrder(int orderId) {
        BatterySwapOrder order = findOrder(orderId);

        if (!"PENDING".equals(order.getStatus())) {
            throw new IllegalStateException("Chỉ có thể duyệt lệnh đang ở trạng thái PENDING.");
        }

        if ("DIRECT_SWAP".equals(order.getOrderType())) {
            executeSwap(order);
            order.setStatus("COMPLETED");
            
            stationTransactionService.recordTransaction(
                order.getStation(), order, order.getFinalPrice(), "SWAP_REVENUE", "Doanh thu đổi pin trực tiếp"
            );
            
            orderRepository.save(order);

            notificationService.createAndSend(
                    order.getDriver(),
                    "Đổi pin thành công",
                    "Yêu cầu đổi pin #" + order.getId() + " tại trạm \"" + order.getStation().getName()
                            + "\" đã được duyệt và thực hiện.",
                    "SWAP_APPROVED"
            );

            log.info("[Order] DIRECT_SWAP #{} APPROVED & COMPLETED", orderId);
        } else {
            order.setStatus("APPROVED");
            orderRepository.save(order);

            notificationService.createAndSend(
                    order.getDriver(),
                    "Đặt lịch đã được duyệt",
                    "Yêu cầu đặt lịch #" + order.getId() + " tại trạm \"" + order.getStation().getName()
                            + "\" đã được duyệt. Vui lòng đến trạm để đổi pin trong vòng 3 tiếng.",
                    "BOOKING_APPROVED"
            );

            log.info("[Order] BOOKING #{} APPROVED — awaiting driver arrival", orderId);
        }

        return SwapOrderResponse.from(order);
    }

    @Transactional
    public SwapOrderResponse completeBooking(int orderId) {
        BatterySwapOrder order = findOrder(orderId);

        if (!"APPROVED".equals(order.getStatus()) || !"BOOKING".equals(order.getOrderType())) {
            throw new IllegalStateException("Chỉ có thể hoàn tất lệnh BOOKING đã được APPROVED.");
        }

        executeSwap(order);
        order.setStatus("COMPLETED");
        
        stationTransactionService.recordTransaction(
            order.getStation(), order, order.getFinalPrice(), "SWAP_REVENUE", "Doanh thu đặt lịch đổi pin"
        );
        
        orderRepository.save(order);

        notificationService.createAndSend(
                order.getDriver(),
                "Đổi pin thành công",
                "Đã hoàn tất đổi pin tại trạm \"" + order.getStation().getName() + "\".",
                "SWAP_COMPLETED"
        );

        log.info("[Order] BOOKING #{} COMPLETED — swap executed", orderId);

        return SwapOrderResponse.from(order);
    }

    @Transactional
    public SwapOrderResponse rejectOrder(int orderId, String reason) {
        BatterySwapOrder order = findOrder(orderId);

        if (!"PENDING".equals(order.getStatus()) && !"APPROVED".equals(order.getStatus())) {
            throw new IllegalStateException("Chỉ có thể từ chối lệnh đang PENDING hoặc APPROVED.");
        }

        releaseReservedBattery(order);
        processRefund(order);

        order.setStatus("REJECTED");
        order.setRejectReason(reason);
        orderRepository.save(order);

        notificationService.createAndSend(
                order.getDriver(),
                "Yêu cầu bị từ chối",
                "Yêu cầu #" + order.getId() + " tại trạm \"" + order.getStation().getName()
                        + "\" đã bị từ chối. Lý do: " + (reason != null ? reason : "Không rõ"),
                "ORDER_REJECTED"
        );

        log.info("[Order] #{} REJECTED — reason: {}", orderId, reason);

        return SwapOrderResponse.from(order);
    }

    @Transactional
    public SwapOrderResponse cancelOrder(String username, int orderId) {
        BatterySwapOrder order = findOrder(orderId);
        User driver = findDriver(username);

        if (!order.getDriver().getId().equals(driver.getId())) {
            throw new SecurityException("Bạn không có quyền hủy lệnh này.");
        }

        if (!"PENDING".equals(order.getStatus()) && !"APPROVED".equals(order.getStatus())) {
            throw new IllegalStateException("Chỉ có thể hủy lệnh đang PENDING hoặc APPROVED.");
        }

        releaseReservedBattery(order);
        processRefund(order);

        order.setStatus("CANCELLED");
        orderRepository.save(order);

        log.info("[Order] #{} CANCELLED by driver '{}'", orderId, username);

        return SwapOrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public SwapOrderResponse getActiveOrder(String username) {
        User driver = findDriver(username);
        BatterySwapOrder order = orderRepository.findActiveOrderByDriver(driver.getId())
                .orElse(null);
        return order != null ? SwapOrderResponse.from(order) : null;
    }

    @Transactional(readOnly = true)
    public Page<SwapOrderResponse> getDriverHistory(String username, Pageable pageable) {
        User driver = findDriver(username);
        return orderRepository.findOrdersByDriver(driver.getId(), pageable)
                .map(SwapOrderResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<SwapOrderResponse> getStaffQueue(String username, Pageable pageable) {
        User staff = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy staff: " + username));
        List<Integer> stationIds = userRepository.findStationsByUserId(staff.getId())
                .stream().map(s -> s.getId()).toList();
        if (stationIds.isEmpty()) {
            return Page.empty(pageable);
        }
        return orderRepository.findPendingOrdersByStationIds(stationIds, pageable)
                .map(SwapOrderResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<SwapOrderResponse> getStaffHistory(String username, String status, Pageable pageable) {
        User staff = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy staff: " + username));
        List<Integer> stationIds = userRepository.findStationsByUserId(staff.getId())
                .stream().map(s -> s.getId()).toList();
        if (stationIds.isEmpty()) {
            return Page.empty(pageable);
        }
        return orderRepository.findOrdersByStationIds(stationIds, status, pageable)
                .map(SwapOrderResponse::from);
    }

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void autoExpireBookings() {
        List<BatterySwapOrder> expired = orderRepository.findExpiredBookings(Instant.now());
        for (BatterySwapOrder order : expired) {
            releaseReservedBattery(order);
            processRefund(order);
            
            order.setStatus("CANCELLED");
            order.setRejectReason("Hết thời gian chờ (3 tiếng).");
            orderRepository.save(order);

            notificationService.createAndSend(
                    order.getDriver(),
                    "Đặt lịch đã hết hạn",
                    "Yêu cầu đặt lịch #" + order.getId() + " tại trạm \"" + order.getStation().getName()
                            + "\" đã bị hủy do quá 3 tiếng.",
                    "BOOKING_EXPIRED"
            );

            log.info("[Order] BOOKING #{} AUTO-EXPIRED", order.getId());
        }
        if (!expired.isEmpty()) {
            log.info("[Scheduler] Auto-expired {} booking(s)", expired.size());
        }
    }


    private BatterySwapOrder findOrder(int orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lệnh với id: " + orderId));
    }

    private User findDriver(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài xế: " + username));
    }

    private Station findActiveStation(Integer stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy trạm với id: " + stationId));
        if (!"ACTIVE".equalsIgnoreCase(station.getStatus())) {
            throw new IllegalStateException("Trạm [" + station.getName() + "] không ở trạng thái ACTIVE.");
        }
        return station;
    }

    private void checkNoActiveOrder(User driver) {
        orderRepository.findActiveOrderByDriver(driver.getId()).ifPresent(existing -> {
            throw new IllegalStateException(
                    "Bạn đã có lệnh #" + existing.getId() + " đang " + existing.getStatus()
                            + ". Vui lòng hủy hoặc chờ xử lý xong trước khi tạo lệnh mới.");
        });
    }

    private Battery findBestBattery(Station station, SwapOrderRequest request) {
        Battery battery;
        if (request.getBatteryId() != null) {
            battery = batteryRepository.findById(request.getBatteryId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy pin với id: " + request.getBatteryId()));

            if (!"AVAILABLE".equalsIgnoreCase(battery.getStatus())) {
                throw new IllegalStateException("Pin #" + request.getBatteryId() + " không ở trạng thái AVAILABLE.");
            }
            if (battery.getCurrentStation() == null || !battery.getCurrentStation().getId().equals(station.getId())) {
                throw new IllegalStateException("Pin #" + request.getBatteryId() + " không ở trạm [" + station.getName() + "].");
            }
            if (battery.getCurrentChargePercentage().compareTo(request.effectiveMinCharge()) < 0) {
                throw new IllegalStateException("Pin #" + request.getBatteryId() + " không đủ charge.");
            }
        } else {
            battery = batteryRepository
                    .findBestAvailableAtStation(station.getId(), request.effectiveMinCharge(), PageRequest.of(0, 1))
                    .stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException(
                            "Không có pin AVAILABLE đủ điều kiện tại trạm [" + station.getName() + "]."));
        }
        return battery;
    }

    private void releaseReservedBattery(BatterySwapOrder order) {
        if (order.getNewBattery() != null && "RESERVED".equalsIgnoreCase(order.getNewBattery().getStatus())) {
            Battery battery = order.getNewBattery();
            battery.setStatus("AVAILABLE");
            batteryRepository.save(battery);
            log.info("[Order] Battery #{} released from RESERVED -> AVAILABLE", battery.getId());
        }
    }

    private void executeSwap(BatterySwapOrder order) {
        Battery oldBattery = order.getOldBattery();
        Battery newBattery = order.getNewBattery();
        User driver = order.getDriver();
        Station station = order.getStation();

        if (newBattery != null && "RESERVED".equalsIgnoreCase(newBattery.getStatus())) {
            newBattery.setStatus("AVAILABLE");
        }

        if (oldBattery != null) {
            oldBattery.setStatus("CHARGING");
            oldBattery.setUser(null);
            oldBattery.setCurrentStation(station);
            batteryRepository.saveAndFlush(oldBattery);

            diagnosticsService.recalculate(oldBattery.getId(), "ON_SWAP");
        }

        newBattery.setStatus("IN_USE");
        newBattery.setUser(driver);
        newBattery.setCurrentStation(null);
        batteryRepository.saveAndFlush(newBattery);

        log.info("[Order] executeSwap — old=#{} → CHARGING, new=#{} → IN_USE for driver '{}'",
                oldBattery != null ? oldBattery.getId() : "none",
                newBattery.getId(), driver.getUsername());
    }

    private void notifyStaffAtStation(Station station, User driver, String orderType) {
        List<User> staffList = userRepository.findStaffsByStationId(station.getId());
        String typeLabel = "BOOKING".equals(orderType) ? "đặt lịch" : "đổi pin trực tiếp";
        String title = "Có yêu cầu " + typeLabel + " mới";
        String message = "Tài xế \"" + driver.getFullName() + "\" đã gửi yêu cầu "
                + typeLabel + " tại trạm \"" + station.getName() + "\".";

        for (User staff : staffList) {
            notificationService.createAndSend(staff, title, message, "NEW_SWAP_ORDER");
        }
    }

    private void processPayment(BatterySwapOrder order, SwapOrderRequest request, User driver) {
        BigDecimal basePrice = new BigDecimal("9000.00");
        BigDecimal discountAmount = BigDecimal.ZERO;
        Voucher voucher = null;

        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            voucher = voucherService.validateAndGetVoucher(request.getVoucherCode());
            if (voucher.getMinOrderValue() != null && basePrice.compareTo(voucher.getMinOrderValue()) < 0) {
                throw new IllegalArgumentException("Đơn hàng không đạt giá trị tối thiểu để áp dụng mã giảm giá.");
            }

            if ("PERCENTAGE".equalsIgnoreCase(voucher.getDiscountType())) {
                discountAmount = basePrice.multiply(voucher.getDiscountValue()).divide(new BigDecimal("100"));
            } else {
                discountAmount = voucher.getDiscountValue();
            }

            if (discountAmount.compareTo(basePrice) > 0) {
                discountAmount = basePrice;
            }
        }

        BigDecimal finalPrice = basePrice.subtract(discountAmount);

        if (driver.getWalletBalance() == null || driver.getWalletBalance().compareTo(finalPrice) < 0) {
            throw new IllegalStateException("Số dư ví không đủ để thực hiện thanh toán (" + finalPrice + " VNĐ). Vui lòng nạp thêm tiền.");
        }

        // Deduct money
        driver.setWalletBalance(driver.getWalletBalance().subtract(finalPrice));
        userRepository.save(driver);

        // Record transaction
        WalletTransaction transaction = new WalletTransaction();
        transaction.setUser(driver);
        transaction.setAmount(finalPrice.negate());
        transaction.setType(TransactionType.PAYMENT_DEDUCTION);
        transaction.setDescription("Thanh toán " + order.getOrderType() + " cho trạm " + order.getStation().getName());
        walletTransactionRepository.save(transaction);

        // Increment voucher usage
        if (voucher != null) {
            voucherService.incrementUseCount(voucher);
        }

        order.setBasePrice(basePrice);
        order.setDiscountAmount(discountAmount);
        order.setFinalPrice(finalPrice);
        order.setVoucher(voucher);
    }

    private void processRefund(BatterySwapOrder order) {
        if (order.getFinalPrice() != null && order.getFinalPrice().compareTo(BigDecimal.ZERO) > 0) {
            User driver = order.getDriver();
            if (driver.getWalletBalance() == null) {
                driver.setWalletBalance(BigDecimal.ZERO);
            }
            driver.setWalletBalance(driver.getWalletBalance().add(order.getFinalPrice()));
            userRepository.save(driver);

            WalletTransaction transaction = new WalletTransaction();
            transaction.setUser(driver);
            transaction.setAmount(order.getFinalPrice());
            transaction.setType(TransactionType.REFUND);
            transaction.setDescription("Hoàn tiền " + order.getOrderType() + " do hủy/từ chối/hết hạn lệnh #" + order.getId());
            walletTransactionRepository.save(transaction);
        }
    }
}
