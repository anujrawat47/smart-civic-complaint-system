package com.civic.config;

import com.civic.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Security Configuration
 * 
 * Configures Spring Security for authentication and authorization.
 * Implements role-based access control for different user types.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    @Autowired
    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    /**
     * Password encoder using BCrypt
     * BCrypt automatically handles salt generation
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configure authentication manager with our custom user details service
     */
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authBuilder = 
            http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder
            .userDetailsService(userDetailsService)
            .passwordEncoder(passwordEncoder());
        return authBuilder.build();
    }

    /**
     * Configure security filter chain with REST access rules
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for simplicity in local REST environment
            .csrf(csrf -> csrf.disable())
            
            // Configure authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public frontend static files & assets
                .requestMatchers(
                    "/", 
                    "/index.html", 
                    "/login.html", 
                    "/register.html", 
                    "/submit-complaint.html", 
                    "/user-dashboard.html", 
                    "/track-complaint.html", 
                    "/admin-dashboard.html", 
                    "/worker-dashboard.html",
                    "/css/**", 
                    "/js/**", 
                    "/images/**", 
                    "/uploads/**"
                ).permitAll()
                
                // Public REST API endpoints
                .requestMatchers(
                    "/api/auth/register", 
                    "/api/stats/**", 
                    "/api/complaints/track/**",
                    "/api/ai/chat"
                ).permitAll()
                
                // Protected Admin REST APIs
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Protected Worker REST APIs
                .requestMatchers("/api/worker/**").hasRole("WORKER")
                
                // Protected Complaint and Auth profile REST APIs
                .requestMatchers("/api/complaints/**", "/api/auth/me").authenticated()
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            
            // Configure REST form login (authenticates via POST /api/auth/login)
            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .successHandler((request, response, authentication) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(200);
                    response.getWriter().write("{\"success\":true,\"message\":\"Login successful\"}");
                })
                .failureHandler((request, response, exception) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(401);
                    response.getWriter().write("{\"success\":false,\"error\":\"Invalid username or password\"}");
                })
                .permitAll()
            )
            
            // Configure REST logout
            .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/api/auth/logout", "POST"))
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(200);
                    response.getWriter().write("{\"success\":true,\"message\":\"Logged out successfully\"}");
                })
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            )
            
            // Configure JSON Exception Handling
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(401);
                    response.getWriter().write("{\"success\":false,\"error\":\"Authentication required\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(403);
                    response.getWriter().write("{\"success\":false,\"error\":\"Access denied\"}");
                })
            )
            
            // Configure session management
            .sessionManagement(session -> session
                .maximumSessions(1)
            );

        return http.build();
    }
}

