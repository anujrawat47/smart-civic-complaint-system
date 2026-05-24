package com.civic.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Assignment DTO
 * 
 * Data Transfer Object for assigning complaints to workers.
 */
public class AssignmentDto {

    @NotNull(message = "Complaint ID is required")
    private Long complaintId;

    @NotNull(message = "Please select a worker")
    private Long workerId;

    private String notes;

    // Default constructor
    public AssignmentDto() {}

    // Constructor with fields
    public AssignmentDto(Long complaintId, Long workerId, String notes) {
        this.complaintId = complaintId;
        this.workerId = workerId;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
