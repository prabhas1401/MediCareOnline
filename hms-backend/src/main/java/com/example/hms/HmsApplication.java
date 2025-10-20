//package com.example.hms;
//
//import org.springframework.boot.SpringApplication;
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//
//@SpringBootApplication
//public class HmsApplication {
//
//    public static void main(String[] args) {
//        SpringApplication.run(HmsApplication.class, args);
//    }
//}

package com.example.hms;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.example.hms.config.JwtConfig;
import com.example.hms.entity.User;
import com.example.hms.repository.UserRepository;

@SpringBootApplication
public class HmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(HmsApplication.class, args);
    }

    @Bean
    CommandLineRunner run(UserRepository userRepository, JwtConfig jwtConfig) {
        return args -> {
            if (!userRepository.existsByEmail("admin@hms.com")) {
                User admin = new User();
                admin.setEmail("admin@hms.com");
                admin.setName("Admin");
                admin.setPassword(new BCryptPasswordEncoder().encode("admin123"));
                admin.setRole("ADMIN");
                userRepository.save(admin);

                // Generate a JWT for admin
                String token = jwtConfig.generateToken(admin.getEmail(), admin.getRole());
                System.out.println("✅ Default admin JWT token: " + token);
            }
        };
    }
}
