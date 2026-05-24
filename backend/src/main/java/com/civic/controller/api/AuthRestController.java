package com.civic.controller.api;

import com.civic.dto.UserRegistrationDto;
import com.civic.entity.User;
import com.civic.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Authentication REST Controller
 * 
 * Provides REST APIs for citizen registration and checking current session profile.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    private final UserService userService;

    @Autowired
    public AuthRestController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Get details of the currently logged-in user
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        
        if (userDetails == null) {
            response.put("success", false);
            response.put("error", "Not authenticated");
            return ResponseEntity.status(401).body(response);
        }

        User user = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        response.put("success", true);
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("phone", user.getPhone());
        response.put("address", user.getAddress());
        response.put("role", user.getRole().name());

        return ResponseEntity.ok(response);
    }

    /**
     * Process citizen registration
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@Valid @RequestBody UserRegistrationDto registrationDto) {
        Map<String, Object> response = new HashMap<>();

        // Check if passwords match
        if (!registrationDto.isPasswordMatching()) {
            response.put("success", false);
            response.put("error", "Passwords do not match");
            return ResponseEntity.badRequest().body(response);
        }

        // Check if username already exists
        if (userService.usernameExists(registrationDto.getUsername())) {
            response.put("success", false);
            response.put("error", "Username already exists");
            return ResponseEntity.badRequest().body(response);
        }

        // Check if email already exists
        if (userService.emailExists(registrationDto.getEmail())) {
            response.put("success", false);
            response.put("error", "Email already registered");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Register user
            userService.registerUser(registrationDto);
            response.put("success", true);
            response.put("message", "Registration successful! Please login.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
