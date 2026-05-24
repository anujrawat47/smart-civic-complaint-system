package com.civic.service;

import com.civic.dto.AssignmentDto;
import com.civic.entity.Assignment;
import com.civic.entity.Complaint;
import com.civic.entity.ComplaintUpdate;
import com.civic.entity.User;
import com.civic.repository.AssignmentRepository;
import com.civic.repository.ComplaintRepository;
import com.civic.repository.ComplaintUpdateRepository;
import com.civic.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Assignment Service
 * 
 * Handles business logic for assigning complaints to workers.
 */
@Service
@Transactional
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ComplaintUpdateRepository complaintUpdateRepository;

    @Autowired
    public AssignmentService(AssignmentRepository assignmentRepository,
                            ComplaintRepository complaintRepository,
                            UserRepository userRepository,
                            ComplaintUpdateRepository complaintUpdateRepository) {
        this.assignmentRepository = assignmentRepository;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.complaintUpdateRepository = complaintUpdateRepository;
    }

    /**
     * Assign a complaint to a worker (admin function)
     */
    public Assignment assignComplaint(AssignmentDto assignmentDto, User assignedBy) {
        // Get the complaint
        Complaint complaint = complaintRepository.findById(assignmentDto.getComplaintId())
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        // Get the worker
        User worker = userRepository.findById(assignmentDto.getWorkerId())
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        // Verify worker role
        if (worker.getRole() != User.Role.ROLE_WORKER) {
            throw new RuntimeException("Selected user is not a worker");
        }

        // Deactivate any existing active assignments for this complaint
        Optional<Assignment> existingAssignment = 
                assignmentRepository.findByComplaintAndIsActiveTrue(complaint);
        existingAssignment.ifPresent(a -> {
            a.setIsActive(false);
            assignmentRepository.save(a);
        });

        // Create new assignment
        Assignment assignment = new Assignment(complaint, worker, assignedBy, assignmentDto.getNotes());
        assignment = assignmentRepository.save(assignment);

        // Update complaint status to ASSIGNED
        complaint.setStatus(Complaint.Status.ASSIGNED);
        complaintRepository.save(complaint);

        // Create update record
        ComplaintUpdate update = ComplaintUpdate.createStatusChange(
                complaint, assignedBy, 
                Complaint.Status.PENDING.name(), 
                Complaint.Status.ASSIGNED.name(),
                "Assigned to " + worker.getFullName() + ". Notes: " + assignmentDto.getNotes());
        complaintUpdateRepository.save(update);

        return assignment;
    }

    /**
     * Reassign complaint to a different worker
     */
    public Assignment reassignComplaint(Long complaintId, Long newWorkerId, User assignedBy, String notes) {
        AssignmentDto dto = new AssignmentDto(complaintId, newWorkerId, notes);
        return assignComplaint(dto, assignedBy);
    }

    /**
     * Get active assignment for a complaint
     */
    public Optional<Assignment> getActiveAssignment(Long complaintId) {
        return assignmentRepository.findByComplaintIdAndIsActiveTrue(complaintId);
    }

    /**
     * Get all assignments for a worker
     */
    public List<Assignment> getWorkerAssignments(Long workerId) {
        return assignmentRepository.findByWorkerIdAndIsActiveTrueOrderByAssignedAtDesc(workerId);
    }

    /**
     * Count active assignments for a worker
     */
    public long countWorkerAssignments(Long workerId) {
        return assignmentRepository.countByWorkerIdAndIsActiveTrue(workerId);
    }

    /**
     * Check if complaint is assigned
     */
    public boolean isComplaintAssigned(Long complaintId) {
        return assignmentRepository.existsByComplaintIdAndIsActiveTrue(complaintId);
    }

    /**
     * Get assignment history for a complaint
     */
    public List<Assignment> getAssignmentHistory(Complaint complaint) {
        return assignmentRepository.findByComplaintOrderByAssignedAtDesc(complaint);
    }
}
