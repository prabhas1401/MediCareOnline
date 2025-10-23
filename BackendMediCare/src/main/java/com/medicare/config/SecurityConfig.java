
package com.medicare.config;

import com.medicare.security.JwtAuthFilter;
import com.medicare.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {
	
    private final TokenService tokenService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public JwtAuthFilter jwtAuthFilter() {
        return new JwtAuthFilter(tokenService);
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // API server; if you have forms, re-enable properly
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // public auth endpoints (registration, login, verify, forgot/reset)
                .requestMatchers("/api/auth/**").permitAll()

                // static and swagger (if any) could be public
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                // role-restricted endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/doctor/**").hasRole("DOCTOR")
                .requestMatchers("/api/patient/**").hasRole("PATIENT")

                // endpoints that any authenticated user can access
                .requestMatchers("/api/common/**").authenticated()

                // everything else requires authentication
                .anyRequest().authenticated()
            )
            // add JWT filter
            .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class)

            // default exception handling (can be enhanced with AuthenticationEntryPoint)
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManager.class);
    }
    
    
}
