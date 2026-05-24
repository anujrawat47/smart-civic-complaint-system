package com.civic.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC Configuration
 * 
 * Configures resource handlers for serving static files
 * and uploaded images.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads/complaints}")
    private String uploadDir;

    /**
     * Configure resource handlers for static files and uploads
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files from the uploads directory
        // Access via: /uploads/complaints/filename.jpg
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/")
                .addResourceLocations("file:uploads/");

        // Static resources (CSS, JS, Images)
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }
}
