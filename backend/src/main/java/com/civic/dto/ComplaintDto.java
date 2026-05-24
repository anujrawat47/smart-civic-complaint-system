package com.civic.dto;

import com.civic.entity.Complaint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

/**
 * Complaint DTO
 * 
 * Data Transfer Object for creating and updating complaints.
 * Handles form data including file upload.
 */
public class ComplaintDto {

    private Long id;

    @NotBlank(message = "Complaint title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Please select a category")
    private Complaint.Category category;

    private Complaint.Priority priority = Complaint.Priority.MEDIUM;

    @NotBlank(message = "Location is required")
    private String location;

    // For file upload
    private MultipartFile image;

    // Existing image path (for updates)
    private String existingImagePath;

    // Default constructor
    public ComplaintDto() {}

    // Create DTO from Entity (for editing)
    public static ComplaintDto fromEntity(Complaint complaint) {
        ComplaintDto dto = new ComplaintDto();
        dto.setId(complaint.getId());
        dto.setTitle(complaint.getTitle());
        dto.setDescription(complaint.getDescription());
        dto.setCategory(complaint.getCategory());
        dto.setPriority(complaint.getPriority());
        dto.setLocation(complaint.getLocation());
        dto.setExistingImagePath(complaint.getImagePath());
        return dto;
    }

    // Convert DTO to Entity
    public Complaint toEntity() {
        Complaint complaint = new Complaint();
        complaint.setTitle(this.title);
        complaint.setDescription(this.description);
        complaint.setCategory(this.category);
        complaint.setPriority(this.priority);
        complaint.setLocation(this.location);
        return complaint;
    }

    // Update existing entity from DTO
    public void updateEntity(Complaint complaint) {
        complaint.setTitle(this.title);
        complaint.setDescription(this.description);
        complaint.setCategory(this.category);
        complaint.setPriority(this.priority);
        complaint.setLocation(this.location);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Complaint.Category getCategory() {
        return category;
    }

    public void setCategory(Complaint.Category category) {
        this.category = category;
    }

    public Complaint.Priority getPriority() {
        return priority;
    }

    public void setPriority(Complaint.Priority priority) {
        this.priority = priority;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }

    public String getExistingImagePath() {
        return existingImagePath;
    }

    public void setExistingImagePath(String existingImagePath) {
        this.existingImagePath = existingImagePath;
    }
}
