package com.team4tech.evbatteryswap.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;
    private final com.team4tech.evbatteryswap.repository.UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = extractJwtFromRequest(request);

            if (StringUtils.hasText(jwt)
                    && !tokenBlacklistService.isBlacklisted(jwt)
                    && jwtTokenProvider.validateToken(jwt)) {
                String username = jwtTokenProvider.getUsernameFromToken(jwt);
                
                com.team4tech.evbatteryswap.entity.User user = userRepository.findByUsername(username).orElse(null);
                if (user == null) {
                    throw new RuntimeException("User not found");
                }
                
                Integer tokenSessionVersion = jwtTokenProvider.getSessionVersionFromToken(jwt);
                Integer currentSessionVersion = user.getSessionVersion();
                if (tokenSessionVersion != null && currentSessionVersion != null && !tokenSessionVersion.equals(currentSessionVersion)) {
                    throw new RuntimeException("Phiên đăng nhập đã hết hạn vì tài khoản được đăng nhập ở nơi khác");
                }

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    public String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
