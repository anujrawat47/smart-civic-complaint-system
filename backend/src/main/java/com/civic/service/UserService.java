package com.civic.service;

import com.civic.dto.UserRegistrationDto;
import com.civic.entity.User;
import com.civic.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * User Service
 * 
 * Handles business logic for user operations.
 * This includes registration, authentication support, and user management.
 */
@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new user (citizen)
     * Encodes password and sets default role
     */
    public User registerUser(UserRegistrationDto registrationDto) {
        // Check if username already exists
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Convert DTO to entity
        User user = registrationDto.toEntity();
        
        // Encode password using BCrypt
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        
        // Set default role as citizen
        user.setRole(User.Role.ROLE_USER);
        user.setEnabled(true);

        return userRepository.save(user);
    }

    /**
     * Create a worker account (admin function)
     */
    public User createWorker(String username, String email, String password, String fullName, String phone) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        User worker = new User();
        worker.setUsername(username);
        worker.setEmail(email);
        worker.setPassword(passwordEncoder.encode(password));
        worker.setFullName(fullName);
        worker.setPhone(phone);
        worker.setRole(User.Role.ROLE_WORKER);
        worker.setEnabled(true);

        return userRepository.save(worker);
    }

    /**
     * Find user by username
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Find user by ID
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get all workers
     */
    public List<User> getAllWorkers() {
        return userRepository.findByRole(User.Role.ROLE_WORKER);
    }

    /**
     * Get all active workers
     */
    public List<User> getActiveWorkers() {
        return userRepository.findByRoleAndEnabledTrue(User.Role.ROLE_WORKER);
    }

    /**
     * Get all citizens
     */
    public List<User> getAllCitizens() {
        return userRepository.findByRole(User.Role.ROLE_USER);
    }

    /**
     * Update user
     */
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Enable/Disable user account
     */
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.getEnabled());
        return userRepository.save(user);
    }

    /**
     * Count total users
     */
    public long countAllUsers() {
        return userRepository.count();
    }

    /**
     * Count users by role
     */
    public long countByRole(User.Role role) {
        return userRepository.countByRole(role);
    }

    /**
     * Search users
     */
    public List<User> searchUsers(String search) {
        return userRepository.searchUsers(search);
    }

    /**
     * Check if username exists
     */
    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Check if email exists
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }
}
