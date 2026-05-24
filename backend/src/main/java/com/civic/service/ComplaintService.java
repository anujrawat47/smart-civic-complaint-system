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
 * Handles business logic for complaint operations
 */
@Service
@Transactional
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintUpdateRepository complaintUpdateRepository;
    private final AzureBlobService azureBlobService;

    @Autowired
    public ComplaintService(ComplaintRepository complaintRepository,
                            ComplaintUpdateRepository complaintUpdateRepository,
                            AzureBlobService azureBlobService) {
        this.complaintRepository = complaintRepository;
        this.complaintUpdateRepository = complaintUpdateRepository;
        this.azureBlobService = azureBlobService;
    }

    /**
     * Submit a new complaint (citizen function)
     */
    public Complaint submitComplaint(ComplaintDto complaintDto, User user, String imagePath) {

        Complaint complaint = complaintDto.toEntity();
        complaint.setUser(user);
        complaint.setStatus(Complaint.Status.PENDING);

        // Image path now stores Azure Blob URL (NOT local file path)
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
     * Get complaints by user
     */
    public List<Complaint> getComplaintsByUser(User user) {
        return complaintRepository.findByUserOrderByCreatedAtDesc(user);
    }

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

    public List<Complaint> getUnassignedComplaints() {
        return complaintRepository.findUnassignedComplaints();
    }

    public List<Complaint> getComplaintsAssignedToWorker(Long workerId) {
        return complaintRepository.findByAssignedWorker(workerId);
    }

    public List<Complaint> filterComplaints(Complaint.Status status,
                                            Complaint.Category category,
                                            Complaint.Priority priority) {
        return complaintRepository.filterComplaints(status, category, priority);
    }

    public List<Complaint> searchComplaints(String search) {
        return complaintRepository.searchComplaints(search);
    }

    /**
     * Update complaint status
     */
    public Complaint updateStatus(Long complaintId,
                                  Complaint.Status newStatus,
                                  User updatedBy,
                                  String message) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        String oldStatus = complaint.getStatus().name();
        complaint.setStatus(newStatus);

        if (newStatus == Complaint.Status.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        ComplaintUpdate update = ComplaintUpdate.createStatusChange(
                complaint, updatedBy, oldStatus, newStatus.name(), message);

        complaintUpdateRepository.save(update);

        return complaintRepository.save(complaint);
    }

    /**
     * Update priority
     */
    public Complaint updatePriority(Long complaintId, Complaint.Priority newPriority) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setPriority(newPriority);
        return complaintRepository.save(complaint);
    }

    /**
     * Add progress update
     */
    public ComplaintUpdate addProgressUpdate(Long complaintId, User worker, String message) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        ComplaintUpdate update = new ComplaintUpdate(
                complaint,
                worker,
                ComplaintUpdate.UpdateType.PROGRESS_UPDATE,
                message
        );

        return complaintUpdateRepository.save(update);
    }

    /**
     * Resolve complaint
     */
    public Complaint resolveComplaint(Long complaintId, User worker, String message) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        String oldStatus = complaint.getStatus().name();

        complaint.setStatus(Complaint.Status.RESOLVED);
        complaint.setResolvedAt(LocalDateTime.now());

        ComplaintUpdate update = new ComplaintUpdate(
                complaint,
                worker,
                ComplaintUpdate.UpdateType.RESOLUTION,
                message
        );

        update.setOldStatus(oldStatus);
        update.setNewStatus(Complaint.Status.RESOLVED.name());

        complaintUpdateRepository.save(update);

        return complaintRepository.save(complaint);
    }

    /**
     * Get updates
     */
    public List<ComplaintUpdate> getComplaintUpdates(Long complaintId) {
        return complaintUpdateRepository.findByComplaintIdOrderByCreatedAtDesc(complaintId);
    }

    /**
     * Counts
     */
    public long countByStatus(Complaint.Status status) {
        return complaintRepository.countByStatus(status);
    }

    public long countByCategory(Complaint.Category category) {
        return complaintRepository.countByCategory(category);
    }

    public long countAll() {
        return complaintRepository.count();
    }

    public long countByUser(User user) {
        return complaintRepository.countByUser(user);
    }

    /**
     * Delete complaint
     */
    public void deleteComplaint(Long complaintId) {
        complaintRepository.deleteById(complaintId);
    }
}