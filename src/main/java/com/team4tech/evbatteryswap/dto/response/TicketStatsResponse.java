package com.team4tech.evbatteryswap.dto.response;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TicketStatsResponse {

    @JsonProperty("Answered")
    private long answered;

    @JsonProperty("Noreply")
    private long noreply;
}