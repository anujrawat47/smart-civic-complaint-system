-- ============================================
-- Smart Civic Complaint Management System
-- Database Schema for MySQL
-- ============================================

-- Create the database (if not exists)
CREATE DATABASE IF NOT EXISTS civic_complaints_db;
USE civic_complaints_db;

-- ============================================
-- Users Table
-- Stores all users (Citizens, Admins, Workers)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    role ENUM('ROLE_USER', 'ROLE_ADMIN', 'ROLE_WORKER') NOT NULL DEFAULT 'ROLE_USER',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- ============================================
-- Complaints Table
-- Stores all citizen complaints
-- ============================================
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('GARBAGE', 'WATER_LEAKAGE', 'DAMAGED_ROAD', 'ELECTRICITY', 'STREETLIGHT', 'OTHER') NOT NULL,
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') DEFAULT 'PENDING',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    image_path VARCHAR(500),
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- Assignments Table
-- Tracks complaint assignments to workers
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    worker_id BIGINT NOT NULL,
    assigned_by BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_complaint_id (complaint_id),
    INDEX idx_worker_id (worker_id),
    INDEX idx_is_active (is_active)
);

-- ============================================
-- Complaint Updates Table
-- Tracks progress updates on complaints
-- ============================================
CREATE TABLE IF NOT EXISTS complaint_updates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    updated_by BIGINT NOT NULL,
    update_type ENUM('STATUS_CHANGE', 'PROGRESS_UPDATE', 'COMMENT', 'RESOLUTION') NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_complaint_id (complaint_id),
    INDEX idx_updated_by (updated_by)
);

-- ============================================
-- Insert Default Admin User
-- Password: admin123 (BCrypt encoded)
-- ============================================
INSERT INTO users (username, email, password, full_name, phone, role, enabled)
SELECT 'admin', 'admin@civic.com', '$2a$10$N.eVCJgJCRwJRdYRQPwz0OdLXVBqNCSMfWs4NeG.SrVfV5VHjLEGe', 'System Administrator', '1234567890', 'ROLE_ADMIN', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Insert Default Worker User
-- Password: worker123 (BCrypt encoded)
INSERT INTO users (username, email, password, full_name, phone, role, enabled)
SELECT 'worker1', 'worker1@civic.com', '$2a$10$yHQxV1U2Gz5MXQDhGpHVAOJYODRVPQKxCCKCKC5xPJJJqFXzxBVey', 'John Worker', '9876543210', 'ROLE_WORKER', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'worker1');

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================
-- Uncomment the following to add sample complaints

/*
INSERT INTO users (username, email, password, full_name, phone, address, role)
VALUES ('citizen1', 'citizen1@example.com', '$2a$10$N.eVCJgJCRwJRdYRQPwz0OdLXVBqNCSMfWs4NeG.SrVfV5VHjLEGe', 'Jane Citizen', '5551234567', '123 Main Street', 'ROLE_USER');

INSERT INTO complaints (title, description, category, status, priority, location, user_id)
VALUES 
('Garbage not collected', 'Garbage has not been collected for 3 days in our area', 'GARBAGE', 'PENDING', 'HIGH', '123 Main Street', 3),
('Water pipe burst', 'There is a major water leakage on the main road', 'WATER_LEAKAGE', 'PENDING', 'URGENT', '456 Oak Avenue', 3),
('Pothole on highway', 'Large pothole causing accidents near the school', 'DAMAGED_ROAD', 'ASSIGNED', 'HIGH', 'Highway 101', 3);
*/
