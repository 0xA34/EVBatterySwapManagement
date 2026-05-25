package com.team4tech.evbatteryswap.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SupportTicketRequest(

        @NotBlank(message = "Tiêu đề không được để trống")
        String subject,

        @NotBlank(message = "Nội dung không được để trống")
        String message
) {
}