package com.civic.dto;

import com.civic.entity.Complaint;
import jakarta.validation.constraints.NotBlank;

/**
 * Complaint Update DTO
 * 
 * Data Transfer Object for workers/admins to update complaint progress.
 */
public class ComplaintUpdateDto {

    private Long complaintId;

    private Complaint.Status newStatus;

    @NotBlank(message = "Please provide an update message")
    private String message;

    // Default constructor
    public ComplaintUpdateDto() {}

    // Getters and Setters
    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public Complaint.Status getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(Complaint.Status newStatus) {
        this.newStatus = newStatus;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
