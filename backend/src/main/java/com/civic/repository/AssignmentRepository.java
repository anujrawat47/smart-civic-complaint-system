package com.civic.repository;

import com.civic.entity.Assignment;
import com.civic.entity.Complaint;
import com.civic.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Assignment Repository
 * 
 * Provides database operations for Assignment entity.
 */
@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    /**
     * Find active assignment for a complaint
     */
    Optional<Assignment> findByComplaintAndIsActiveTrue(Complaint complaint);

    /**
     * Find active assignment by complaint ID
     */
    Optional<Assignment> findByComplaintIdAndIsActiveTrue(Long complaintId);

    /**
     * Find all assignments for a complaint
     */
    List<Assignment> findByComplaintOrderByAssignedAtDesc(Complaint complaint);

    /**
     * Find all active assignments for a worker
     */
    List<Assignment> findByWorkerAndIsActiveTrueOrderByAssignedAtDesc(User worker);

    /**
     * Find all assignments by worker ID
     */
    List<Assignment> findByWorkerIdAndIsActiveTrueOrderByAssignedAtDesc(Long workerId);

    /**
     * Count active assignments for a worker
     */
    long countByWorkerAndIsActiveTrue(User worker);

    /**
     * Count active assignments by worker ID
     */
    long countByWorkerIdAndIsActiveTrue(Long workerId);

    /**
     * Check if complaint is assigned
     */
    boolean existsByComplaintAndIsActiveTrue(Complaint complaint);

    /**
     * Check if complaint is assigned by ID
     */
    boolean existsByComplaintIdAndIsActiveTrue(Long complaintId);
}
