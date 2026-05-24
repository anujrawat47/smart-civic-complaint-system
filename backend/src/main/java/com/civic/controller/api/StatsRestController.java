package com.civic.controller.api;

import com.civic.entity.Complaint;
import com.civic.entity.User;
import com.civic.service.ComplaintService;
import com.civic.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Statistics REST Controller
 * 
 * Provides metrics and statistics for public home page and role-specific dashboards.
 */
@RestController
@RequestMapping("/api/stats")
public class StatsRestController {

    private final ComplaintService complaintService;
    private final UserService userService;

    @Autowired
    public StatsRestController(ComplaintService complaintService, UserService userService) {
        this.complaintService = complaintService;
        this.userService = userService;
    }

    /**
     * Get public statistics for the landing page
     */
    @GetMapping("/public")
    public ResponseEntity<Map<String, Object>> getPublicStats() {
        Map<String, Object> response = new HashMap<>();

        long total = complaintService.countAll();
        long pending = complaintService.countByStatus(Complaint.Status.PENDING);
        long inProgress = complaintService.countByStatus(Complaint.Status.IN_PROGRESS);
        long resolved = complaintService.countByStatus(Complaint.Status.RESOLVED);

        // Get 5 recent resolved complaints for display
        List<Complaint> rawResolved = complaintService.getComplaintsByStatus(Complaint.Status.RESOLVED);
        List<Map<String, Object>> successStories = new ArrayList<>();
        int count = 0;
        for (Complaint c : rawResolved) {
            if (count >= 5) break;
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("title", c.getTitle());
            map.put("categoryDisplay", c.getCategory().getDisplayName());
            map.put("location", c.getLocation());
            map.put("resolvedAt", c.getResolvedAt());
            successStories.add(map);
            count++;
        }

        response.put("success", true);
        response.put("total", total);
        response.put("pending", pending);
        response.put("inProgress", inProgress);
        response.put("resolved", resolved);
        response.put("successStories", successStories);

        return ResponseEntity.ok(response);
    }

    /**
     * Get dashboard metrics scoped by current user role
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();

        if (userDetails == null) {
            response.put("success", false);
            response.put("error", "Not authenticated");
            return ResponseEntity.status(401).body(response);
        }

        User user = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> metrics = new HashMap<>();

        if (user.getRole() == User.Role.ROLE_ADMIN) {
            metrics.put("totalComplaints", complaintService.countAll());
            metrics.put("pendingComplaints", complaintService.countByStatus(Complaint.Status.PENDING));
            metrics.put("assignedComplaints", complaintService.countByStatus(Complaint.Status.ASSIGNED));
            metrics.put("inProgressComplaints", complaintService.countByStatus(Complaint.Status.IN_PROGRESS));
            metrics.put("resolvedComplaints", complaintService.countByStatus(Complaint.Status.RESOLVED));
            metrics.put("totalCitizens", userService.countByRole(User.Role.ROLE_USER));
            metrics.put("totalWorkers", userService.countByRole(User.Role.ROLE_WORKER));
        } else if (user.getRole() == User.Role.ROLE_WORKER) {
            List<Complaint> assigned = complaintService.getComplaintsAssignedToWorker(user.getId());
            long total = assigned.size();
            long pending = assigned.stream().filter(c -> c.getStatus() == Complaint.Status.ASSIGNED).count();
            long inProgress = assigned.stream().filter(c -> c.getStatus() == Complaint.Status.IN_PROGRESS).count();
            long resolved = assigned.stream().filter(c -> c.getStatus() == Complaint.Status.RESOLVED).count();

            metrics.put("totalAssigned", total);
            metrics.put("pendingComplaints", pending);
            metrics.put("inProgressComplaints", inProgress);
            metrics.put("resolvedComplaints", resolved);
        } else {
            // ROLE_USER (Citizen)
            List<Complaint> myComplaints = complaintService.getComplaintsByUser(user);
            long total = myComplaints.size();
            long pending = myComplaints.stream().filter(c -> c.getStatus() == Complaint.Status.PENDING).count();
            long inProgress = myComplaints.stream().filter(c -> c.getStatus() == Complaint.Status.ASSIGNED || c.getStatus() == Complaint.Status.IN_PROGRESS).count();
            long resolved = myComplaints.stream().filter(c -> c.getStatus() == Complaint.Status.RESOLVED).count();

            metrics.put("totalComplaints", total);
            metrics.put("pendingComplaints", pending);
            metrics.put("inProgressComplaints", inProgress);
            metrics.put("resolvedComplaints", resolved);
        }

        response.put("success", true);
        response.put("role", user.getRole().name());
        response.put("metrics", metrics);

        return ResponseEntity.ok(response);
    }
}
