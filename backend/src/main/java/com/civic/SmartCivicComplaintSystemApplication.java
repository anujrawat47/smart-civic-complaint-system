package com.civic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Application Class
 * 
 * This is the entry point of the Smart Civic Complaint Management System.
 * The @SpringBootApplication annotation combines:
 * - @Configuration: Marks this as a configuration class
 * - @EnableAutoConfiguration: Enables Spring Boot auto-configuration
 * - @ComponentScan: Scans for components in this package and sub-packages
 */
@SpringBootApplication
public class SmartCivicComplaintSystemApplication {

    public static void main(String[] args) {
        // Launch the Spring Boot application
        SpringApplication.run(SmartCivicComplaintSystemApplication.class, args);
        System.out.println("====================================================");
        System.out.println("Smart Civic Complaint Management System is Running!");
        System.out.println("Access the application at: http://localhost:8080");
        System.out.println("====================================================");
    }
}
