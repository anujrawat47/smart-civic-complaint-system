package com.civic.repository;

import com.civic.entity.Complaint;
import com.civic.entity.ComplaintUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ComplaintUpdate Repository
 * 
 * Provides database operations for ComplaintUpdate entity.
 */
@Repository
public interface ComplaintUpdateRepository extends JpaRepository<ComplaintUpdate, Long> {

    /**
     * Find all updates for a complaint (newest first)
     */
    List<ComplaintUpdate> findByComplaintOrderByCreatedAtDesc(Complaint complaint);

    /**
     * Find all updates for a complaint by ID
     */
    List<ComplaintUpdate> findByComplaintIdOrderByCreatedAtDesc(Long complaintId);

    /**
     * Find updates by type
     */
    List<ComplaintUpdate> findByComplaintAndUpdateTypeOrderByCreatedAtDesc(
            Complaint complaint, ComplaintUpdate.UpdateType updateType);

    /**
     * Count updates for a complaint
     */
    long countByComplaint(Complaint complaint);
}
