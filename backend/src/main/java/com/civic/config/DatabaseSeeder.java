package com.civic.config;

import com.civic.entity.User;
import com.civic.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Database Seeder
 * 
 * Automatically runs on application startup to ensure that 
 * default roles (Admin, Worker, Citizen) have correct and verified
 * credentials for local development and testing.
 */
@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Executing Smart Civic Database Seeder...");

        // 1. Seed or Update Admin User
        seedUser("admin", "admin@civic.com", "admin123", "System Administrator", User.Role.ROLE_ADMIN);

        // 2. Seed or Update Worker User
        seedUser("worker1", "worker1@civic.com", "worker123", "John Worker", User.Role.ROLE_WORKER);

        // 3. Seed or Update Citizen User
        seedUser("citizen1", "citizen1@example.com", "citizen123", "Jane Citizen", User.Role.ROLE_USER);

        System.out.println("Smart Civic Database Seeder completed successfully!");
    }

    private void seedUser(String username, String email, String password, String fullName, User.Role role) {
        Optional<User> existingUserOpt = userRepository.findByUsername(username);

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            // Ensure the password matches the BCrypt hash of the expected password
            existingUser.setPassword(passwordEncoder.encode(password));
            existingUser.setRole(role);
            existingUser.setEnabled(true);
            existingUser.setEmail(email);
            existingUser.setFullName(fullName);
            userRepository.save(existingUser);
            System.out.println("Updated existing user: " + username + " with correct password hash.");
        } else {
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode(password));
            newUser.setFullName(fullName);
            newUser.setRole(role);
            newUser.setEnabled(true);
            userRepository.save(newUser);
            System.out.println("Created new default user: " + username);
        }
    }
}
