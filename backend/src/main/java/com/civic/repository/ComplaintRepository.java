package com.civic.repository;

import com.civic.entity.Complaint;
import com.civic.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Complaint Repository
 * 
 * Provides database operations for Complaint entity.
 * Includes various filtering and search capabilities.
 */
@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    /**
     * Find all complaints by user (for citizen's complaint history)
     */
    List<Complaint> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Find all complaints by user ID
     */
    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find complaints by status
     */
    List<Complaint> findByStatusOrderByCreatedAtDesc(Complaint.Status status);

    /**
     * Find complaints by category
     */
    List<Complaint> findByCategoryOrderByCreatedAtDesc(Complaint.Category category);

    /**
     * Find complaints by status and category
     */
    List<Complaint> findByStatusAndCategoryOrderByCreatedAtDesc(
            Complaint.Status status, Complaint.Category category);

    /**
     * Find complaints by priority
     */
    List<Complaint> findByPriorityOrderByCreatedAtDesc(Complaint.Priority priority);

    /**
     * Find all complaints ordered by creation date (newest first)
     */
    List<Complaint> findAllByOrderByCreatedAtDesc();

    /**
     * Find complaints with pagination
     */
    Page<Complaint> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Count complaints by status
     */
    long countByStatus(Complaint.Status status);

    /**
     * Count complaints by category
     */
    long countByCategory(Complaint.Category category);

    /**
     * Count complaints by user
     */
    long countByUser(User user);

    /**
     * Search complaints by title or description
     */
    @Query("SELECT c FROM Complaint c WHERE " +
           "LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.location) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "ORDER BY c.createdAt DESC")
    List<Complaint> searchComplaints(@Param("search") String search);

    /**
     * Find complaints assigned to a specific worker
     */
    @Query("SELECT c FROM Complaint c JOIN c.assignments a " +
           "WHERE a.worker.id = :workerId AND a.isActive = true " +
           "ORDER BY c.createdAt DESC")
    List<Complaint> findByAssignedWorker(@Param("workerId") Long workerId);

    /**
     * Find complaints assigned to worker by status
     */
    @Query("SELECT c FROM Complaint c JOIN c.assignments a " +
           "WHERE a.worker.id = :workerId AND a.isActive = true AND c.status = :status " +
           "ORDER BY c.createdAt DESC")
    List<Complaint> findByAssignedWorkerAndStatus(
            @Param("workerId") Long workerId, 
            @Param("status") Complaint.Status status);

    /**
     * Count complaints assigned to a worker
     */
    @Query("SELECT COUNT(c) FROM Complaint c JOIN c.assignments a " +
           "WHERE a.worker.id = :workerId AND a.isActive = true")
    long countByAssignedWorker(@Param("workerId") Long workerId);

    /**
     * Find unassigned complaints (pending without active assignments)
     */
    @Query("SELECT c FROM Complaint c WHERE c.status = 'PENDING' " +
           "AND NOT EXISTS (SELECT a FROM Assignment a WHERE a.complaint = c AND a.isActive = true) " +
           "ORDER BY c.createdAt DESC")
    List<Complaint> findUnassignedComplaints();

    /**
     * Filter complaints with multiple criteria
     */
    @Query("SELECT c FROM Complaint c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:priority IS NULL OR c.priority = :priority) " +
           "ORDER BY c.createdAt DESC")
    List<Complaint> filterComplaints(
            @Param("status") Complaint.Status status,
            @Param("category") Complaint.Category category,
            @Param("priority") Complaint.Priority priority);
}
