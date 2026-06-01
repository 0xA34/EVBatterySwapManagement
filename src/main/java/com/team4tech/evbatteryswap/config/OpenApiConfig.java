package com.team4tech.evbatteryswap.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures Swagger UI with API metadata and a Bearer JWT security scheme.
 * The "Authorize" button in Swagger UI allows users to supply their token.
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI evBatterySwapOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ChargeX Management API")
                        .description("""
                                REST API for the ChargeX Management system.
                                
                                **Access to this documentation requires ADMIN privileges.**
                                
                                To authorise:
                                1. Call `POST /api/auth/login` with your credentials.
                                2. Copy the `accessToken` from the response.
                                3. Click the **Authorize** button and enter: `<your_token>` (without "Bearer ").
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Team4Tech")
                                .email("something@team4tech.com"))
                        .license(new License()
                                .name("Proprietary")))
                // Register the Bearer JWT security scheme
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste your JWT token here (without the 'Bearer ' prefix)")));
    }
}
