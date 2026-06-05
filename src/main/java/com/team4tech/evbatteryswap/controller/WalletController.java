package com.team4tech.evbatteryswap.controller;

import com.team4tech.evbatteryswap.dto.request.TopUpRequest;
import com.team4tech.evbatteryswap.dto.response.TransactionResponse;
import com.team4tech.evbatteryswap.service.WalletService;
import com.team4tech.evbatteryswap.security.JwtAuthenticationFilter;
import com.team4tech.evbatteryswap.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@Tag(name = "Wallet", description = "API quản lý ví tiền (Cộng tiền thủ công)")
public class WalletController {

    private final WalletService walletService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtTokenProvider jwtTokenProvider;
    private final com.team4tech.evbatteryswap.service.interfaces.IUserService userService;

    @PostMapping("/top-up")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cộng tiền thủ công cho người dùng", description = "API này dành cho ADMIN để nạp tiền vào ví của người dùng. Tối đa 5,000,000 VND / lần.")
    public ResponseEntity<TransactionResponse> topUpWallet(
            @Valid @RequestBody TopUpRequest request,
            HttpServletRequest httpRequest) {
            
        String token = jwtAuthenticationFilter.extractJwtFromRequest(httpRequest);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        
        // Find admin/staff id
        var user = userService.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        
        TransactionResponse response = walletService.manualTopUp(user.getId(), request);
        return ResponseEntity.ok(response);
    }
}
