package com.civic.service;

import com.civic.dto.ComplaintDto;
import com.civic.entity.Complaint;
import com.civic.entity.ComplaintUpdate;
import com.civic.entity.User;
import com.civic.repository.ComplaintRepository;
import com.civic.repository.ComplaintUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Complaint Service
 * 
 * Handles business logic for complaint operations.
 * This includes creating, updating, and managing complaints.
 */
@Service
@Transactional
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintUpdateRepository complaintUpdateRepository;

    @Autowired
    public ComplaintService(ComplaintRepository complaintRepository,
                           ComplaintUpdateRepository complaintUpdateRepository) {
        this.complaintRepository = complaintRepository;
        this.complaintUpdateRepository = complaintUpdateRepository;
    }

    /**
     * Submit a new complaint (citizen function)
     */
    public Complaint submitComplaint(ComplaintDto complaintDto, User user, String imagePath) {
        Complaint complaint = complaintDto.toEntity();
        complaint.setUser(user);
        complaint.setStatus(Complaint.Status.PENDING);
        
        if (imagePath != null && !imagePath.isEmpty()) {
            complaint.setImagePath(imagePath);
        }

        return complaintRepository.save(complaint);
    }

    /**
     * Find complaint by ID
     */
    public Optional<Complaint> findById(Long id) {
        return complaintRepository.findById(id);
    }

    /**
     * Get all complaints
     */
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Get all complaints with pagination
     */
    public Page<Complaint> getAllComplaints(Pageable pageable) {
        return complaintRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    /**
     * Get complaints by user (citizen's complaint history)
     */
    public List<Complaint> getComplaintsByUser(User user) {
        return complaintRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Get complaints by user ID
     */
    public List<Complaint> getComplaintsByUserId(Long userId) {
        return complaintRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get complaints by status
     */
    public List<Complaint> getComplaintsByStatus(Complaint.Status status) {
        return complaintRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    /**
     * Get complaints by category
     */
    public List<Complaint> getComplaintsByCategory(Complaint.Category category) {
        return complaintRepository.findByCategoryOrderByCreatedAtDesc(category);
    }

    /**
     * Get unassigned complaints
     */
    public List<Complaint> getUnassignedComplaints() {
        return complaintRepository.findUnassignedComplaints();
    }

    /**
     * Get complaints assigned to a worker
     */
    public List<Complaint> getComplaintsAssignedToWorker(Long workerId) {
        return complaintRepository.findByAssignedWorker(workerId);
    }

    /**
     * Filter complaints by multiple criteria
     */
    public List<Complaint> filterComplaints(Complaint.Status status, 
                                           Complaint.Category category,
                                           Complaint.Priority priority) {
        return complaintRepository.filterComplaints(status, category, priority);
    }

    /**
     * Search complaints
     */
    public List<Complaint> searchComplaints(String search) {
        return complaintRepository.searchComplaints(search);
    }

    /**
     * Update complaint status (admin/worker function)
     */
    public Complaint updateStatus(Long complaintId, Complaint.Status newStatus, User updatedBy, String message) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        String oldStatus = complaint.getStatus().name();
        complaint.setStatus(newStatus);

        // If resolved, set resolved timestamp
        if (newStatus == Complaint.Status.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        // Create update record
        ComplaintUpdate update = ComplaintUpdate.createStatusChange(
                complaint, updatedBy, oldStatus, newStatus.name(), message);
        complaintUpdateRepository.save(update);

        return complaintRepository.save(complaint);
    }

    /**
     * Update complaint priority (admin function)
     */
    public Complaint updatePriority(Long complaintId, Complaint.Priority newPriority) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setPriority(newPriority);
        return complaintRepository.save(complaint);
    }

    /**
     * Add progress update (worker function)
     */
    public ComplaintUpdate addProgressUpdate(Long complaintId, User worker, String message) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        ComplaintUpdate update = new ComplaintUpdate(
                complaint, worker, ComplaintUpdate.UpdateType.PROGRESS_UPDATE, message);
        return complaintUpdateRepository.save(update);
    }

    /**
     * Resolve complaint (worker function)
     */
    public Complaint resolveComplaint(Long complaintId, User worker, String message) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        String oldStatus = complaint.getStatus().name();
        complaint.setStatus(Complaint.Status.RESOLVED);
        complaint.setResolvedAt(LocalDateTime.now());

        // Create resolution update
        ComplaintUpdate update = new ComplaintUpdate(
                complaint, worker, ComplaintUpdate.UpdateType.RESOLUTION, message);
        update.setOldStatus(oldStatus);
        update.setNewStatus(Complaint.Status.RESOLVED.name());
        complaintUpdateRepository.save(update);

        return complaintRepository.save(complaint);
    }

    /**
     * Get updates for a complaint
     */
    public List<ComplaintUpdate> getComplaintUpdates(Long complaintId) {
        return complaintUpdateRepository.findByComplaintIdOrderByCreatedAtDesc(complaintId);
    }

    /**
     * Count complaints by status
     */
    public long countByStatus(Complaint.Status status) {
        return complaintRepository.countByStatus(status);
    }

    /**
     * Count complaints by category
     */
    public long countByCategory(Complaint.Category category) {
        return complaintRepository.countByCategory(category);
    }

    /**
     * Count total complaints
     */
    public long countAll() {
        return complaintRepository.count();
    }

    /**
     * Count complaints by user
     */
    public long countByUser(User user) {
        return complaintRepository.countByUser(user);
    }

    /**
     * Delete complaint (admin function - use with caution)
     */
    public void deleteComplaint(Long complaintId) {
        complaintRepository.deleteById(complaintId);
    }
}
