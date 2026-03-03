package com.plantdisease.controller;

import com.plantdisease.security.JwtUtil;
import com.plantdisease.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> req) {
        try {
            userService.register(req.get("username"), req.get("email"), req.get("password"));
            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.get("username"), req.get("password"))
            );
            UserDetails user = userService.loadUserByUsername(req.get("username"));
            String token = jwtUtil.generateToken(user);
            return ResponseEntity.ok(Map.of(
                    "token",    token,
                    "username", user.getUsername()
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
    }
}