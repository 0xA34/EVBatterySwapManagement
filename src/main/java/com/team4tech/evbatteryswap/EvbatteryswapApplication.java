package com.team4tech.evbatteryswap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EvbatteryswapApplication {

	public static void main(String[] args) {
		SpringApplication.run(EvbatteryswapApplication.class, args);
	}

}
