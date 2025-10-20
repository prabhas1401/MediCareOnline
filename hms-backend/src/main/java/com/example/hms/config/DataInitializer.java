package com.example.hms.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.hms.entity.User;
import com.example.hms.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin already exists
        if (!userRepository.findByEmail("admin@hms.com").isPresent()) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@hms.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // plaintext: admin123
            admin.setRole("ADMIN");

            userRepository.save(admin);
            System.out.println("✅ Default admin user created: admin@hms.com / admin123");
        } else {
            System.out.println("ℹ️ Admin user already exists");
        }
    }
}
