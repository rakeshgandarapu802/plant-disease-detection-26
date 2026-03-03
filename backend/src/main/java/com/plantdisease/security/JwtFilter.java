package com.plantdisease.security;

import com.plantdisease.repository.UserRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    // @Lazy breaks the circular dependency:
    // JwtFilter → SecurityConfig → JwtFilter
    public JwtFilter(JwtUtil jwtUtil, @Lazy UserRepository userRepository) {
        this.jwtUtil        = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String username = jwtUtil.extractUsername(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Load user directly from repository — avoids UserService dependency
                    userRepository.findByUsername(username).ifPresent(user -> {
                        if (jwtUtil.isTokenValid(token, username)) {
                            var authorities = List.of(
                                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                            );
                            var authToken = new UsernamePasswordAuthenticationToken(
                                    username, null, authorities
                            );
                            authToken.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                            );
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                    });
                }
            } catch (Exception ignored) {
                // Invalid/expired token — just skip
            }
        }
        chain.doFilter(request, response);
    }
}