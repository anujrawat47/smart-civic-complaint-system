package com.civic.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * ComplaintUpdate Entity
 * 
 * Tracks all updates and progress on a complaint.
 * This creates an audit trail of status changes, comments, and resolutions.
 */
@Entity
@Table(name = "complaint_updates")
public class ComplaintUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The complaint this update belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    // The user who made this update (admin or worker)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by", nullable = false)
    private User updatedBy;

    // Type of update
    @Enumerated(EnumType.STRING)
    @Column(name = "update_type", nullable = false)
    private UpdateType updateType;

    // For status changes, track old and new status
    @Column(name = "old_status", length = 50)
    private String oldStatus;

    @Column(name = "new_status", length = 50)
    private String newStatus;

    // Update message or comment
    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Enum for update types
    public enum UpdateType {
        STATUS_CHANGE("Status Changed"),
        PROGRESS_UPDATE("Progress Update"),
        COMMENT("Comment Added"),
        RESOLUTION("Complaint Resolved");

        private final String displayName;

        UpdateType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Default constructor
    public ComplaintUpdate() {}

    // Constructor for creating a new update
    public ComplaintUpdate(Complaint complaint, User updatedBy, UpdateType updateType, String message) {
        this.complaint = complaint;
        this.updatedBy = updatedBy;
        this.updateType = updateType;
        this.message = message;
    }

    // Static factory method for status change updates
    public static ComplaintUpdate createStatusChange(Complaint complaint, User updatedBy, 
                                                      String oldStatus, String newStatus, String message) {
        ComplaintUpdate update = new ComplaintUpdate();
        update.setComplaint(complaint);
        update.setUpdatedBy(updatedBy);
        update.setUpdateType(UpdateType.STATUS_CHANGE);
        update.setOldStatus(oldStatus);
        update.setNewStatus(newStatus);
        update.setMessage(message);
        return update;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }

    public User getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
    }

    public UpdateType getUpdateType() {
        return updateType;
    }

    public void setUpdateType(UpdateType updateType) {
        this.updateType = updateType;
    }

    public String getOldStatus() {
        return oldStatus;
    }

    public void setOldStatus(String oldStatus) {
        this.oldStatus = oldStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
