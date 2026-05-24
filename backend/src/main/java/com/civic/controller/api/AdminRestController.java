package com.civic.controller.api;

import com.civic.entity.User;
import com.civic.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Admin REST Controller
 * 
 * Provides REST APIs for administrators to manage field workers and citizens.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminRestController {

    private final UserService userService;

    @Autowired
    public AdminRestController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Get list of all registered citizens
     */
    @GetMapping("/citizens")
    public ResponseEntity<Map<String, Object>> listCitizens(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        
        List<User> citizens = userService.getAllCitizens();
        List<Map<String, Object>> data = new ArrayList<>();
        for (User u : citizens) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("email", u.getEmail());
            map.put("fullName", u.getFullName());
            map.put("phone", u.getPhone());
            map.put("address", u.getAddress());
            map.put("enabled", u.getEnabled());
            map.put("createdAt", u.getCreatedAt());
            data.add(map);
        }

        response.put("success", true);
        response.put("citizens", data);
        return ResponseEntity.ok(response);
    }

    /**
     * Get list of all workers
     */
    @GetMapping("/workers")
    public ResponseEntity<Map<String, Object>> listWorkers(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        
        List<User> workers = userService.getAllWorkers();
        List<Map<String, Object>> data = new ArrayList<>();
        for (User u : workers) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("email", u.getEmail());
            map.put("fullName", u.getFullName());
            map.put("phone", u.getPhone());
            map.put("enabled", u.getEnabled());
            map.put("createdAt", u.getCreatedAt());
            data.add(map);
        }

        response.put("success", true);
        response.put("workers", data);
        return ResponseEntity.ok(response);
    }

    /**
     * Create a new field worker
     */
    @PostMapping("/workers")
    public ResponseEntity<Map<String, Object>> addWorker(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> response = new HashMap<>();

        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");
        String fullName = body.get("fullName");
        String phone = body.get("phone");

        if (username == null || email == null || password == null || fullName == null) {
            response.put("success", false);
            response.put("error", "Username, email, password, and full name are required");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            userService.createWorker(username, email, password, fullName, phone);
            response.put("success", true);
            response.put("message", "Worker added successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to add worker: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Toggle worker status (enable/disable account)
     */
    @PostMapping("/workers/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleWorkerStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> response = new HashMap<>();

        try {
            userService.toggleUserStatus(id);
            response.put("success", true);
            response.put("message", "Worker status updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to toggle worker status: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
