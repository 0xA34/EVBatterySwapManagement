package com.team4tech.evbatteryswap.service;

import com.team4tech.evbatteryswap.dto.request.SwapRequest;
import com.team4tech.evbatteryswap.dto.response.BatteryDiagnosticsResponse;
import com.team4tech.evbatteryswap.dto.response.SwapResponse;
import com.team4tech.evbatteryswap.entity.Battery;
import com.team4tech.evbatteryswap.entity.Station;
import com.team4tech.evbatteryswap.entity.User;
import com.team4tech.evbatteryswap.repository.BatteryRepository;
import com.team4tech.evbatteryswap.repository.StationRepository;
import com.team4tech.evbatteryswap.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit test cho {@link BatterySwapService}.
 * Dùng Mockito — không cần Spring context, không cần DB.
 */
@ExtendWith(MockitoExtension.class)
class BatterySwapServiceTest {

    @Mock BatteryRepository        batteryRepository;
    @Mock StationRepository        stationRepository;
    @Mock UserRepository           userRepository;
    @Mock BatteryDiagnosticsService diagnosticsService;

    @InjectMocks
    BatterySwapService swapService;

    // Fixtures

    private User    driver;
    private Battery oldBattery;
    private Battery newBattery;
    private Station station;

    @BeforeEach
    void setUp() {
        driver = new User();
        driver.setId(1);
        driver.setUsername("driver01");

        station = new Station();
        station.setId(10);
        station.setName("Trạm Q1");
        station.setStatus("ACTIVE");

        oldBattery = new Battery();
        oldBattery.setId(100);
        oldBattery.setSerialNumber("OLD-001");
        oldBattery.setModel("ModelA");
        oldBattery.setCapacityKwh(new BigDecimal("60.00"));
        oldBattery.setCurrentChargePercentage(new BigDecimal("25.00")); // sắp hết
        oldBattery.setHealthPercentage(new BigDecimal("88.00"));
        oldBattery.setChargeCycles(300);
        oldBattery.setStatus("IN_USE");
        oldBattery.setUser(driver);

        newBattery = new Battery();
        newBattery.setId(200);
        newBattery.setSerialNumber("NEW-002");
        newBattery.setModel("ModelB");
        newBattery.setCapacityKwh(new BigDecimal("60.00"));
        newBattery.setCurrentChargePercentage(new BigDecimal("95.00")); // đầy
        newBattery.setHealthPercentage(new BigDecimal("94.00"));
        newBattery.setChargeCycles(150);
        newBattery.setStatus("AVAILABLE");
        newBattery.setCurrentStation(station);
    }

    // HAPPY PATH
    @Test
    @DisplayName("Swap thành công — kiểm tra toàn bộ state thay đổi")
    void swap_success() {
        // Arrange
        BatteryDiagnosticsResponse fakeSoh = mockDiagnosticsResponse(oldBattery.getId());

        when(userRepository.findByUsername("driver01")).thenReturn(Optional.of(driver));
        when(batteryRepository.findCurrentBatteryOfUser(driver.getId()))
                .thenReturn(Optional.of(oldBattery));
        when(stationRepository.findById(station.getId())).thenReturn(Optional.of(station));
        when(batteryRepository.findBestAvailableAtStation(
                eq(station.getId()), any(BigDecimal.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(newBattery)));
        when(batteryRepository.save(any(Battery.class))).thenAnswer(inv -> inv.getArgument(0));
        when(diagnosticsService.recalculate(oldBattery.getId(), "ON_SWAP")).thenReturn(fakeSoh);

        // Act
        SwapResponse response = swapService.swap("driver01", new SwapRequest(station.getId(), null, null));

        // Assert
        System.out.println("=== Swap thành công ===");
        System.out.println("Message : " + response.message());
        System.out.println("Pin cũ  : #" + response.returnedBattery().id()
                + " | status=" + response.returnedBattery().status()
                + " | cycles=" + response.returnedBattery().chargeCycles());
        System.out.println("SoH cũ  : " + response.returnedBatterySoh().soh()
                + " | grade=" + response.returnedBatterySoh().healthGrade());
        System.out.println("Pin mới : #" + response.newBattery().id()
                + " | status=" + response.newBattery().status()
                + " | charge=" + response.newBattery().currentChargePercentage() + "%");

        // Pin cũ phải là CHARGING, KHÔNG được cộng cycle, trả về trạm, không còn user
        assertThat(oldBattery.getStatus()).isEqualTo("CHARGING");
        assertThat(oldBattery.getChargeCycles()).isEqualTo(300);  // Giữ nguyên 300
        assertThat(oldBattery.getUser()).isNull();
        assertThat(oldBattery.getCurrentStation()).isEqualTo(station);

        // Pin mới phải là IN_USE, gán cho driver, rời trạm
        assertThat(newBattery.getStatus()).isEqualTo("IN_USE");
        assertThat(newBattery.getUser()).isEqualTo(driver);
        assertThat(newBattery.getCurrentStation()).isNull();

        // diagnosticsService phải được gọi đúng một lần với trigger ON_SWAP
        verify(diagnosticsService, times(1)).recalculate(oldBattery.getId(), "ON_SWAP");

        // batteryRepository.save phải được gọi 2 lần (pin cũ + pin mới)
        verify(batteryRepository, times(2)).save(any(Battery.class));

        // Response đầy đủ
        assertThat(response.returnedBattery().id()).isEqualTo(100);
        assertThat(response.newBattery().id()).isEqualTo(200);
        assertThat(response.swappedAt()).isNotNull();
    }

    @Test
    @DisplayName("Swap với minChargePercent mặc định (null → 80%)")
    void swap_defaultMinCharge() {
        BatteryDiagnosticsResponse fakeSoh = mockDiagnosticsResponse(oldBattery.getId());

        when(userRepository.findByUsername("driver01")).thenReturn(Optional.of(driver));
        when(batteryRepository.findCurrentBatteryOfUser(driver.getId()))
                .thenReturn(Optional.of(oldBattery));
        when(stationRepository.findById(station.getId())).thenReturn(Optional.of(station));
        when(batteryRepository.findBestAvailableAtStation(
                eq(station.getId()), eq(new BigDecimal("80")), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(newBattery)));
        when(batteryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(diagnosticsService.recalculate(oldBattery.getId(), "ON_SWAP")).thenReturn(fakeSoh);

        // minChargePercent = null → effectiveMinCharge() = 80
        SwapResponse response = swapService.swap("driver01", new SwapRequest(station.getId(), null, null));

        assertThat(response).isNotNull();
        // verify đúng 80% được truyền vào query
        verify(batteryRepository).findBestAvailableAtStation(
                eq(station.getId()), eq(new BigDecimal("80")), any(Pageable.class));
    }

    @Test
    @DisplayName("Swap với pin chỉ định cụ thể (batteryId)")
    void swap_withSpecificBatteryId() {
        BatteryDiagnosticsResponse fakeSoh = mockDiagnosticsResponse(oldBattery.getId());

        when(userRepository.findByUsername("driver01")).thenReturn(Optional.of(driver));
        when(batteryRepository.findCurrentBatteryOfUser(driver.getId())).thenReturn(Optional.of(oldBattery));
        when(stationRepository.findById(station.getId())).thenReturn(Optional.of(station));
        when(batteryRepository.findById(200)).thenReturn(Optional.of(newBattery)); // Tìm đúng ID này
        when(batteryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(diagnosticsService.recalculate(oldBattery.getId(), "ON_SWAP")).thenReturn(fakeSoh);

        // Act - Truyền batteryId = 200
        SwapResponse response = swapService.swap("driver01", new SwapRequest(station.getId(), null, 200));

        // Assert
        assertThat(response.newBattery().id()).isEqualTo(200);
        // Kiểm tra findBestAvailableAtStation không được gọi vì đã có ID
        verify(batteryRepository, never()).findBestAvailableAtStation(any(), any(), any());
    }

    // LỖI NGHIỆP VỤ

    @Test
    @DisplayName("Tài xế không tồn tại → EntityNotFoundException")
    void swap_driverNotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> swapService.swap("ghost", new SwapRequest(station.getId(), null, null)))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("ghost");
    }

    @Test
    @DisplayName("Tài xế chưa có pin IN_USE → IllegalStateException")
    void swap_driverHasNoBattery() {
        when(userRepository.findByUsername("driver01")).thenReturn(Optional.of(driver));
        when(batteryRepository.findCurrentBatteryOfUser(driver.getId()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> swapService.swap("driver01", new SwapRequest(station.getId(), null, null)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("chưa có pin IN_USE");
    }

    @Test
    @DisplayName("Trạm không tồn tại → EntityNotFoundException")
    void swap_stationNotFound() {
        when(userRepository.findByUsername("driver01")).thenReturn(Optional.of(driver));
        when(batteryRepository.findCurrentBatteryOfUser(driver.getId()))
                .thenReturn(Optional.of(oldBattery));
        when(stationRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> swapService.swap("driver01", new SwapRequest(99, null, null)))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("Trạm không ACTIVE → IllegalStateException")
    void swap_stationNotActive() {
        station.setStatus("MAINTENANCE");

        when(userRepository.findByUsername("driver01")).thenReturn(Optional.of(driver));
        when(batteryRepository.findCurrentBatteryOfUser(driver.getId()))
                .thenReturn(Optional.of(oldBattery));
        when(stationRepository.findById(station.getId())).thenReturn(Optional.of(station));

        assertThatThrownBy(() -> swapService.swap("driver01", new SwapRequest(station.getId(), null, null)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ACTIVE");
    }

    @Test
    @DisplayName("Không có pin AVAILABLE đủ charge tại trạm → IllegalStateException")
    void swap_noBatteryAvailableAtStation() {
        when(userRepository.findByUsername("driver01")).thenReturn(Optional.of(driver));
        when(batteryRepository.findCurrentBatteryOfUser(driver.getId()))
                .thenReturn(Optional.of(oldBattery));
        when(stationRepository.findById(station.getId())).thenReturn(Optional.of(station));
        when(batteryRepository.findBestAvailableAtStation(
                any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of())); // rỗng

        assertThatThrownBy(() -> swapService.swap("driver01", new SwapRequest(station.getId(), null, null)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining(station.getName());   // message chứa tên trạm "Trạm Q1"
    }

    @Test
    @DisplayName("getCurrentBattery — tài xế có pin → trả về pin đúng")
    void getCurrentBattery_success() {
        when(userRepository.findByUsername("driver01")).thenReturn(Optional.of(driver));
        when(batteryRepository.findCurrentBatteryOfUser(driver.getId()))
                .thenReturn(Optional.of(oldBattery));

        Battery result = swapService.getCurrentBattery("driver01");

        assertThat(result.getId()).isEqualTo(100);
        assertThat(result.getStatus()).isEqualTo("IN_USE");
    }

    @Test
    @DisplayName("getCurrentBattery — tài xế chưa có pin → IllegalStateException")
    void getCurrentBattery_noBattery() {
        when(userRepository.findByUsername("driver01")).thenReturn(Optional.of(driver));
        when(batteryRepository.findCurrentBatteryOfUser(driver.getId()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> swapService.getCurrentBattery("driver01"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("chưa được gán pin");
    }

    // RENT

    @Test
    @DisplayName("Thuê pin thành công cho tài xế mới")
    void rent_success() {
        when(userRepository.findByUsername("driver01")).thenReturn(Optional.of(driver));
        when(batteryRepository.findCurrentBatteryOfUser(driver.getId())).thenReturn(Optional.empty()); // Chưa có pin
        when(stationRepository.findById(station.getId())).thenReturn(Optional.of(station));
        when(batteryRepository.findBestAvailableAtStation(eq(station.getId()), any(), any()))
                .thenReturn(new PageImpl<>(List.of(newBattery)));
        when(batteryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        com.team4tech.evbatteryswap.dto.request.RentRequest rentReq = new com.team4tech.evbatteryswap.dto.request.RentRequest(station.getId(), null, null);
        com.team4tech.evbatteryswap.dto.response.BatteryResponse response = swapService.rent("driver01", rentReq);

        assertThat(response.id()).isEqualTo(200);
        assertThat(newBattery.getStatus()).isEqualTo("IN_USE");
        assertThat(newBattery.getUser()).isEqualTo(driver);
        verify(diagnosticsService).recalculate(newBattery.getId(), "ON_RENT");
    }

    @Test
    @DisplayName("Tài xế đã có pin -> Không cho thuê mới")
    void rent_alreadyHasBattery() {
        when(userRepository.findByUsername("driver01")).thenReturn(Optional.of(driver));
        when(batteryRepository.findCurrentBatteryOfUser(driver.getId())).thenReturn(Optional.of(oldBattery)); // Đã có pin

        com.team4tech.evbatteryswap.dto.request.RentRequest rentReq = new com.team4tech.evbatteryswap.dto.request.RentRequest(station.getId(), null, null);
        assertThatThrownBy(() -> swapService.rent("driver01", rentReq))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("đã có pin đang sử dụng");
    }

    @Test
    @DisplayName("Thuê pin với pin chỉ định cụ thể")
    void rent_withSpecificBatteryId() {
        when(userRepository.findByUsername("driver01")).thenReturn(Optional.of(driver));
        when(batteryRepository.findCurrentBatteryOfUser(driver.getId())).thenReturn(Optional.empty());
        when(stationRepository.findById(station.getId())).thenReturn(Optional.of(station));
        when(batteryRepository.findById(200)).thenReturn(Optional.of(newBattery)); // Chỉ định pin này
        when(batteryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        com.team4tech.evbatteryswap.dto.request.RentRequest rentReq = new com.team4tech.evbatteryswap.dto.request.RentRequest(station.getId(), null, 200);
        com.team4tech.evbatteryswap.dto.response.BatteryResponse response = swapService.rent("driver01", rentReq);

        assertThat(response.id()).isEqualTo(200);
        verify(batteryRepository, never()).findBestAvailableAtStation(any(), any(), any());
    }

    // CHARGE COMPLETE

    @Test
    @DisplayName("Đánh dấu sạc đầy thành công")
    void markFullyCharged_success() {
        oldBattery.setStatus("CHARGING");
        oldBattery.setChargeCycles(10);
        when(batteryRepository.findById(oldBattery.getId())).thenReturn(Optional.of(oldBattery));
        when(batteryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        swapService.markFullyCharged(oldBattery.getId());

        assertThat(oldBattery.getStatus()).isEqualTo("AVAILABLE");
        assertThat(oldBattery.getChargeCycles()).isEqualTo(11); // +1 cycle
        assertThat(oldBattery.getCurrentChargePercentage()).isEqualTo(new BigDecimal("100.00"));
        verify(diagnosticsService).recalculate(oldBattery.getId(), "ON_CHARGE_COMPLETE");
    }

    @Test
    @DisplayName("Pin không CHARGING -> Không cho sạc đầy")
    void markFullyCharged_notCharging() {
        oldBattery.setStatus("IN_USE");
        when(batteryRepository.findById(oldBattery.getId())).thenReturn(Optional.of(oldBattery));

        assertThatThrownBy(() -> swapService.markFullyCharged(oldBattery.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("không ở trạng thái CHARGING");
    }

    // Helpers

    private BatteryDiagnosticsResponse mockDiagnosticsResponse(int batteryId) {
        return new BatteryDiagnosticsResponse(
                batteryId, "OLD-001", "ModelA",
                new BigDecimal("85.60"),  // soh
                new BigDecimal("86.00"),  // sohCycle
                new BigDecimal("97.00"),  // sohAge
                new BigDecimal("25.00"),  // soc
                "GOOD",                   // healthGrade
                301,                      // chargeCycles
                750,                      // rulCycles
                new BigDecimal("3.150"),  // degradationRate
                LocalDate.now().minusMonths(24),
                24L,
                java.time.Instant.now()
        );
    }
}
