package com.team4tech.evbatteryswap.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springdoc.core.customizers.OperationCustomizer;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.media.StringSchema;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures Swagger UI with API metadata, a Bearer JWT security scheme,
 * and groups APIs into categories for better organization.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OperationCustomizer customGlobalHeaders() {
        return (operation, handlerMethod) -> {
            Parameter deviceIdHeader = new Parameter()
                    .in("header")
                    .schema(new StringSchema()._default("swagger-device-123"))
                    .name("X-Device-Id")
                    .description("Device Fingerprint for Rate Limiting. Required for all /api/** endpoints.")
                    .required(true);
            operation.addParametersItem(deviceIdHeader);
            return operation;
        };
    }

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

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("1. Admin API")
                .pathsToMatch("/api/admin/**", "/api/wallet/**", "/api/info")
                .build();
    }

    @Bean
    public GroupedOpenApi staffApi() {
        return GroupedOpenApi.builder()
                .group("2. Staff API")
                .pathsToMatch("/api/staff/**", "/api/wallet/**", "/api/info")
                .build();
    }

    @Bean
    public GroupedOpenApi driverApi() {
        return GroupedOpenApi.builder()
                .group("3. Driver API")
                .pathsToMatch("/api/driver/**", "/api/info")
                .build();
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("4. Auth API")
                .pathsToMatch("/api/auth/**", "/api/public/**")
                .build();
    }

    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("5. All APIs")
                .pathsToMatch("/**")
                .build();
    }
}
