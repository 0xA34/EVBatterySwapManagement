package com.team4tech.evbatteryswap.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to apply a specific rate limit to an API endpoint.
 * Overrides the global rate limit.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ApiRateLimit {
    
    /**
     * Number of requests allowed.
     */
    int capacity();

    /**
     * Time window in minutes.
     */
    int minutes() default 1;
}
