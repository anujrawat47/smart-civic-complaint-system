package com.civic.controller.api;

import com.civic.dto.AssignmentDto;
import com.civic.dto.ComplaintDto;
import com.civic.entity.Assignment;
import com.civic.entity.Complaint;
import com.civic.entity.ComplaintUpdate;
import com.civic.entity.User;
import com.civic.service.AssignmentService;
import com.civic.service.ComplaintService;
import com.civic.service.FileStorageService;
import com.civic.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * Complaint REST Controller
 * 
 * Provides REST APIs for citizens, workers, and administrators to submit,
 * filter, track, update, and assign civic complaints.
 */
@RestController
@RequestMapping("/api/complaints")
public class ComplaintRestController {

    private final ComplaintService complaintService;
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final AssignmentService assignmentService;

    @Autowired
    public ComplaintRestController(ComplaintService complaintService,
                                   UserService userService,
                                   FileStorageService fileStorageService,
                                   AssignmentService assignmentService) {
        this.complaintService = complaintService;
        this.userService = userService;
        this.fileStorageService = fileStorageService;
        this.assignmentService = assignmentService;
    }

    /**
     * Submit a new complaint (Citizens only)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> submitComplaint(
            @Valid @ModelAttribute ComplaintDto complaintDto,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> response = new HashMap<>();

        try {
            User user = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));


            // Handle image upload
            String imagePath = null;
            if (image != null && !image.isEmpty()) {
                if (!fileStorageService.isValidImageFile(image)) {
                    response.put("success", false);
                    response.put("error", "Invalid image file format (Only JPG, PNG, GIF, WEBP allowed)");
                    return ResponseEntity.badRequest().body(response);
                }
                imagePath = fileStorageService.storeFile(image);
            }

            Complaint saved = complaintService.submitComplaint(complaintDto, user, imagePath);

            response.put("success", true);
            response.put("message", "Complaint submitted successfully!");
            response.put("complaintId", saved.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to submit complaint: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * List all complaints scoped by logged-in user role
     * - Admin: Returns all complaints
     * - Worker: Returns assigned complaints
     * - Citizen: Returns their own complaints
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> listComplaints(
            @RequestParam(required = false) Complaint.Status status,
            @RequestParam(required = false) Complaint.Category category,
            @RequestParam(required = false) Complaint.Priority priority,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean personal,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> response = new HashMap<>();
        User user = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Complaint> rawComplaints;

        // Fetch based on Role
        if (personal) {
            rawComplaints = complaintService.getComplaintsByUser(user);
        } else if (user.getRole() == User.Role.ROLE_ADMIN) {
            if (search != null && !search.isEmpty()) {
                rawComplaints = complaintService.searchComplaints(search);
            } else if (status != null || category != null || priority != null) {
                rawComplaints = complaintService.filterComplaints(status, category, priority);
            } else {
                rawComplaints = complaintService.getAllComplaints();
            }
        } else if (user.getRole() == User.Role.ROLE_WORKER) {

            rawComplaints = complaintService.getComplaintsAssignedToWorker(user.getId());
            if (status != null) {
                rawComplaints = rawComplaints.stream().filter(c -> c.getStatus() == status).toList();
            }
        } else {
            // ROLE_USER (Citizen)
            rawComplaints = complaintService.getComplaintsByUser(user);
        }

        // Map entity details to clean JSON DTOs to avoid circular dependencies
        List<Map<String, Object>> complaints = new ArrayList<>();
        for (Complaint c : rawComplaints) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("title", c.getTitle());
            map.put("category", c.getCategory().name());
            map.put("categoryDisplay", c.getCategory().getDisplayName());
            map.put("status", c.getStatus().name());
            map.put("statusDisplay", c.getStatus().getDisplayName());
            map.put("priority", c.getPriority().name());
            map.put("priorityDisplay", c.getPriority().getDisplayName());
            map.put("location", c.getLocation());
            map.put("createdAt", c.getCreatedAt());
            map.put("updatedAt", c.getUpdatedAt());
            map.put("citizenName", c.getUser().getFullName());
            map.put("imagePath", c.getImagePath());
            
            Assignment active = c.getActiveAssignment();
            if (active != null) {
                map.put("workerId", active.getWorker().getId());
                map.put("workerName", active.getWorker().getFullName());
            }
            complaints.add(map);
        }


        response.put("success", true);
        response.put("complaints", complaints);
        return ResponseEntity.ok(response);
    }

    /**
     * Get specific complaint details by ID (with authorization rules)
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getComplaintDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> response = new HashMap<>();
        User user = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Complaint complaint = complaintService.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        // Authorization checks
        if (user.getRole() == User.Role.ROLE_USER && !complaint.getUser().getId().equals(user.getId())) {
            response.put("success", false);
            response.put("error", "Access denied");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        if (user.getRole() == User.Role.ROLE_WORKER) {
            Optional<Assignment> activeAssign = assignmentService.getActiveAssignment(id);
            if (activeAssign.isEmpty() || !activeAssign.get().getWorker().getId().equals(user.getId())) {
                response.put("success", false);
                response.put("error", "Access denied - task not assigned to you");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        }

        // Build clean JSON mapping
        Map<String, Object> data = new HashMap<>();
        data.put("id", complaint.getId());
        data.put("title", complaint.getTitle());
        data.put("description", complaint.getDescription());
        data.put("category", complaint.getCategory().name());
        data.put("categoryDisplay", complaint.getCategory().getDisplayName());
        data.put("status", complaint.getStatus().name());
        data.put("statusDisplay", complaint.getStatus().getDisplayName());
        data.put("priority", complaint.getPriority().name());
        data.put("priorityDisplay", complaint.getPriority().getDisplayName());
        data.put("location", complaint.getLocation());
        data.put("latitude", complaint.getLatitude());
        data.put("longitude", complaint.getLongitude());
        data.put("imagePath", complaint.getImagePath());
        data.put("createdAt", complaint.getCreatedAt());
        data.put("updatedAt", complaint.getUpdatedAt());
        data.put("resolvedAt", complaint.getResolvedAt());
        data.put("citizenName", complaint.getUser().getFullName());
        data.put("citizenEmail", complaint.getUser().getEmail());
        data.put("citizenPhone", complaint.getUser().getPhone());

        // Worker active assignment
        Optional<Assignment> assignment = assignmentService.getActiveAssignment(id);
        if (assignment.isPresent()) {
            Map<String, Object> assignMap = new HashMap<>();
            assignMap.put("workerId", assignment.get().getWorker().getId());
            assignMap.put("workerName", assignment.get().getWorker().getFullName());
            assignMap.put("workerPhone", assignment.get().getWorker().getPhone());
            assignMap.put("assignedAt", assignment.get().getAssignedAt());
            assignMap.put("notes", assignment.get().getNotes());
            data.put("assignment", assignMap);
        }

        // Timeline Updates list
        List<ComplaintUpdate> rawUpdates = complaintService.getComplaintUpdates(id);
        List<Map<String, Object>> updates = new ArrayList<>();
        for (ComplaintUpdate u : rawUpdates) {
            Map<String, Object> upMap = new HashMap<>();
            upMap.put("id", u.getId());
            upMap.put("updateType", u.getUpdateType().name());
            upMap.put("oldStatus", u.getOldStatus());
            upMap.put("newStatus", u.getNewStatus());
            upMap.put("message", u.getMessage());
            upMap.put("createdAt", u.getCreatedAt());
            upMap.put("updatedBy", u.getUpdatedBy().getFullName());
            upMap.put("updatedByRole", u.getUpdatedBy().getRole().name());
            updates.add(upMap);
        }
        data.put("updates", updates);

        response.put("success", true);
        response.put("complaint", data);
        return ResponseEntity.ok(response);
    }

    /**
     * Public Tracking Endpoint (By Complaint ID)
     * Anyone can view public details of a complaint using this
     */
    @GetMapping("/track/{id}")
    public ResponseEntity<Map<String, Object>> publicTrackComplaint(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Support inputting "CIV-1" or just raw ID "1"
            String cleanedIdStr = id.toUpperCase().replace("CIV-", "").trim();
            Long complaintId = Long.parseLong(cleanedIdStr);

            Complaint complaint = complaintService.findById(complaintId)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            Map<String, Object> data = new HashMap<>();
            data.put("id", complaint.getId());
            data.put("title", complaint.getTitle());
            data.put("categoryDisplay", complaint.getCategory().getDisplayName());
            data.put("status", complaint.getStatus().name());
            data.put("statusDisplay", complaint.getStatus().getDisplayName());
            data.put("priorityDisplay", complaint.getPriority().getDisplayName());
            data.put("location", complaint.getLocation());
            data.put("createdAt", complaint.getCreatedAt());
            data.put("updatedAt", complaint.getUpdatedAt());

            // Timeline Updates list (public view removes user specific/private info if needed)
            List<ComplaintUpdate> rawUpdates = complaintService.getComplaintUpdates(complaintId);
            List<Map<String, Object>> updates = new ArrayList<>();
            for (ComplaintUpdate u : rawUpdates) {
                Map<String, Object> upMap = new HashMap<>();
                upMap.put("updateType", u.getUpdateType().name());
                upMap.put("newStatus", u.getNewStatus());
                upMap.put("message", u.getMessage());
                upMap.put("createdAt", u.getCreatedAt());
                updates.add(upMap);
            }
            data.put("updates", updates);

            response.put("success", true);
            response.put("complaint", data);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Complaint not found. Please verify the ID number.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Assign complaint to a worker (Admins only)
     */
    @PostMapping("/{id}/assign")
    public ResponseEntity<Map<String, Object>> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignmentDto assignmentDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> response = new HashMap<>();

        try {
            User admin = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            if (admin.getRole() != User.Role.ROLE_ADMIN) {
                response.put("success", false);
                response.put("error", "Access denied - admins only");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            assignmentDto.setComplaintId(id);
            assignmentService.assignComplaint(assignmentDto, admin);

            response.put("success", true);
            response.put("message", "Complaint assigned successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to assign complaint: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update complaint status (Admin and Assigned Workers only)
     */
    @PostMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> response = new HashMap<>();

        try {
            User user = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Complaint.Status newStatus = Complaint.Status.valueOf(body.get("status").toUpperCase());
            String message = body.getOrDefault("message", "Status updated");

            // Authorize Status Change
            if (user.getRole() == User.Role.ROLE_WORKER) {
                Optional<Assignment> activeAssign = assignmentService.getActiveAssignment(id);
                if (activeAssign.isEmpty() || !activeAssign.get().getWorker().getId().equals(user.getId())) {
                    response.put("success", false);
                    response.put("error", "Access denied - not assigned to you");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
                }
                
                // Workers can only advance to IN_PROGRESS or RESOLVED
                if (newStatus != Complaint.Status.IN_PROGRESS && newStatus != Complaint.Status.RESOLVED) {
                    response.put("success", false);
                    response.put("error", "Workers can only change status to In Progress or Resolved");
                    return ResponseEntity.badRequest().body(response);
                }
            } else if (user.getRole() != User.Role.ROLE_ADMIN) {
                response.put("success", false);
                response.put("error", "Access denied - unauthorized role");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            complaintService.updateStatus(id, newStatus, user, message);

            response.put("success", true);
            response.put("message", "Status updated successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to update status: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update complaint priority (Admins only)
     */
    @PostMapping("/{id}/priority")
    public ResponseEntity<Map<String, Object>> updatePriority(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> response = new HashMap<>();

        try {
            User user = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getRole() != User.Role.ROLE_ADMIN) {
                response.put("success", false);
                response.put("error", "Access denied - admins only");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            Complaint.Priority newPriority = Complaint.Priority.valueOf(body.get("priority").toUpperCase());
            complaintService.updatePriority(id, newPriority);

            response.put("success", true);
            response.put("message", "Priority updated successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to update priority: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Add progress update or resolve complaint (Workers only)
     */
    @PostMapping("/{id}/updates")
    public ResponseEntity<Map<String, Object>> addProgressUpdate(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> response = new HashMap<>();

        try {
            User worker = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Worker not found"));

            String message = body.get("message");
            String type = body.getOrDefault("type", "PROGRESS_UPDATE").toUpperCase();

            // Authorize
            Optional<Assignment> activeAssign = assignmentService.getActiveAssignment(id);
            if (activeAssign.isEmpty() || !activeAssign.get().getWorker().getId().equals(worker.getId())) {
                response.put("success", false);
                response.put("error", "Access denied - not assigned to you");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            if (type.equals("RESOLUTION")) {
                complaintService.resolveComplaint(id, worker, message);
                response.put("message", "Complaint resolved successfully!");
            } else {
                complaintService.addProgressUpdate(id, worker, message);
                response.put("message", "Progress update added");
            }

            response.put("success", true);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to add update: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
