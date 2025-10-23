
package com.medicare.security;

import java.io.IOException;
import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.medicare.service.TokenService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final TokenService tokenService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return; // no token present — request proceeds and will be blocked by security rules if necessary
        }

        String token = header.substring(7);
        try {
            if (!tokenService.validateToken(token)) {
                // invalid token — just continue; security entrypoint will respond 401
                filterChain.doFilter(request, response);
                return;
            }

            Long userId = tokenService.getUserIdFromToken(token);
            String role = tokenService.getRoleFromToken(token); // e.g., "ADMIN"

            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(userId, null, Collections.singletonList(authority));

            // set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (Exception ex) {
            log.debug("JWT processing failed: {}", ex.getMessage());
            // don't throw here — allow downstream to respond with 401/403 as appropriate
        }

        filterChain.doFilter(request, response);
    }
}
