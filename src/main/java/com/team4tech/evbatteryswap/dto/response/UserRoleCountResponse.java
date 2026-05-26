package com.team4tech.evbatteryswap.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRoleCountResponse {
    private String role;
    private long count;
}
