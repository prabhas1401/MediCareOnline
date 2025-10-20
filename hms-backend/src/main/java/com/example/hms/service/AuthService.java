//package com.example.hms.service;
//
//import java.text.SimpleDateFormat;
//import java.util.Date;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//import com.example.hms.config.JwtConfig;
//import com.example.hms.dto.LoginRequest;
//import com.example.hms.dto.RegisterRequest;
//import com.example.hms.entity.Doctor;
//import com.example.hms.entity.Patient;
//import com.example.hms.entity.User;
//import com.example.hms.repository.UserRepository;
//
//@Service
//public class AuthService {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    @Autowired
//    private JwtConfig jwtConfig;
//
//    // ✅ Register API logic
//    public void register(RegisterRequest request) {
//        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
//            throw new RuntimeException("Email already registered");
//        }
//
//        User user;
//        if ("doctor".equalsIgnoreCase(request.getRole())) {
//            Doctor doctor = new Doctor();
//            doctor.setName(request.getName());
//            doctor.setEmail(request.getEmail());
//            doctor.setPassword(passwordEncoder.encode(request.getPassword()));
//            doctor.setRole("doctor");
//            doctor.setPhone(request.getPhone());
//            doctor.setQualification(request.getQualification());
//            doctor.setExperience(request.getExperience());
//            doctor.setSpecialization(request.getSpecialization());
//            doctor.setApproved(false); // Admin approval required
//            user = doctor;
//
//        } else if ("patient".equalsIgnoreCase(request.getRole())) {
//            Patient patient = new Patient();
//            patient.setName(request.getName());
//            patient.setEmail(request.getEmail());
//            patient.setPassword(passwordEncoder.encode(request.getPassword()));
//            patient.setRole("patient");
//
//            // ✅ Convert String DOB (from frontend) to Date
//            try {
//                if (request.getDob() != null && !request.getDob().isEmpty()) {
//                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
//                    Date dob = sdf.parse(request.getDob());
//                    patient.setDob(dob);
//                }
//            } catch (Exception e) {
//                throw new RuntimeException("Invalid date format. Expected yyyy-MM-dd");
//            }
//
//            patient.setMobile(request.getMobile());
//            patient.setGender(request.getGender());
//            user = patient;
//
//        } else {
//            // Default: Admin or other roles
//            user = new User();
//            user.setName(request.getName());
//            user.setEmail(request.getEmail());
//            user.setPassword(passwordEncoder.encode(request.getPassword()));
//            user.setRole(request.getRole());
//        }
//
//        userRepository.save(user);
//    }
//
//    // ✅ Login API logic (works with frontend)
//    public String login(LoginRequest request) {
//        User user = userRepository.findByEmail(request.getEmail())
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//            throw new RuntimeException("Invalid password");
//        }
//
//        // If role-based restriction
//        if ("doctor".equalsIgnoreCase(user.getRole()) && user instanceof Doctor) {
//            Doctor doctor = (Doctor) user;
//            if (!doctor.isApproved()) {
//                throw new RuntimeException("Doctor account not approved yet");
//            }
//        }
//
//        // ✅ Return JWT Token
//        return jwtConfig.generateToken(user.getEmail());
//    }
//}
//package com.example.hms.service;
//
//import java.text.SimpleDateFormat;
//import java.util.Date;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//import com.example.hms.config.JwtConfig;
//import com.example.hms.dto.LoginRequest;
//import com.example.hms.dto.RegisterRequest;
//import com.example.hms.entity.Doctor;
//import com.example.hms.entity.Patient;
//import com.example.hms.entity.User;
//import com.example.hms.repository.UserRepository;
//
//@Service
//public class AuthService {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    @Autowired
//    private JwtConfig jwtConfig;
//
//    // ✅ Register API logic
//    public void register(RegisterRequest request) {
//        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
//            throw new RuntimeException("Email already registered");
//        }
//
//        User user;
//        if ("doctor".equalsIgnoreCase(request.getRole())) {
//            Doctor doctor = new Doctor();
//            doctor.setName(request.getName());
//            doctor.setEmail(request.getEmail());
//            doctor.setPassword(passwordEncoder.encode(request.getPassword()));
//            doctor.setRole("doctor");
//            doctor.setPhone(request.getPhone());
//            doctor.setQualification(request.getQualification());
//            doctor.setExperience(request.getExperience());
//            doctor.setSpecialization(request.getSpecialization());
//
//            // ✅ Automatically approve doctors (demo/testing mode)
//            doctor.setApproved(true);
//
//            user = doctor;
//
//        } else if ("patient".equalsIgnoreCase(request.getRole())) {
//            Patient patient = new Patient();
//            patient.setName(request.getName());
//            patient.setEmail(request.getEmail());
//            patient.setPassword(passwordEncoder.encode(request.getPassword()));
//            patient.setRole("patient");
//
//            // ✅ Convert String DOB (from frontend) to Date
//            try {
//                if (request.getDob() != null && !request.getDob().isEmpty()) {
//                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
//                    Date dob = sdf.parse(request.getDob());
//                    patient.setDob(dob);
//                }
//            } catch (Exception e) {
//                throw new RuntimeException("Invalid date format. Expected yyyy-MM-dd");
//            }
//
//            patient.setMobile(request.getMobile());
//            patient.setGender(request.getGender());
//            user = patient;
//
//        } else {
//            // Default: Admin or other roles
//            user = new User();
//            user.setName(request.getName());
//            user.setEmail(request.getEmail());
//            user.setPassword(passwordEncoder.encode(request.getPassword()));
//            user.setRole(request.getRole());
//        }
//
//        userRepository.save(user);
//    }
//
//    // ✅ Login API logic (works with frontend)
//    public String login(LoginRequest request) {
//        User user = userRepository.findByEmail(request.getEmail())
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//            throw new RuntimeException("Invalid password");
//        }
//
//        // ✅ Role-based restriction (doctor must be approved)
//        if ("doctor".equalsIgnoreCase(user.getRole()) && user instanceof Doctor) {
//            Doctor doctor = (Doctor) user;
//            if (!doctor.isApproved()) {
//                throw new RuntimeException("Doctor account not approved yet");
//            }
//        }
//
//        // ✅ Return JWT Token
//        return jwtConfig.generateToken(user.getEmail());
//    }
//}

//package com.example.hms.service;
//
//import java.text.SimpleDateFormat;
//import java.util.Date;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//import com.example.hms.config.JwtConfig;
//import com.example.hms.dto.LoginRequest;
//import com.example.hms.dto.LoginResponse;
//import com.example.hms.dto.RegisterRequest;
//import com.example.hms.entity.Doctor;
//import com.example.hms.entity.Patient;
//import com.example.hms.entity.User;
//import com.example.hms.repository.UserRepository;
//
//@Service
//public class AuthService {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    @Autowired
//    private JwtConfig jwtConfig;
//
//    // ✅ Register API
//    public void register(RegisterRequest request) {
//        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
//            throw new RuntimeException("Email already registered");
//        }
//
//        User user;
//        if ("doctor".equalsIgnoreCase(request.getRole())) {
//            Doctor doctor = new Doctor();
//            doctor.setName(request.getName());
//            doctor.setEmail(request.getEmail());
//            doctor.setPassword(passwordEncoder.encode(request.getPassword()));
//            doctor.setRole("doctor");
//            doctor.setPhone(request.getPhone());
//            doctor.setQualification(request.getQualification());
//            doctor.setExperience(request.getExperience());
//            doctor.setSpecialization(request.getSpecialization());
//            doctor.setApproved(true); // set false if you want admin approval
//
//            user = doctor;
//
//        } else if ("patient".equalsIgnoreCase(request.getRole())) {
//            Patient patient = new Patient();
//            patient.setName(request.getName());
//            patient.setEmail(request.getEmail());
//            patient.setPassword(passwordEncoder.encode(request.getPassword()));
//            patient.setRole("patient");
//
//            try {
//                if (request.getDob() != null && !request.getDob().isEmpty()) {
//                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
//                    Date dob = sdf.parse(request.getDob());
//                    patient.setDob(dob);
//                }
//            } catch (Exception e) {
//                throw new RuntimeException("Invalid date format. Expected yyyy-MM-dd");
//            }
//
//            patient.setMobile(request.getMobile());
//            patient.setGender(request.getGender());
//            user = patient;
//
//        } else {
//            // Admin or other roles
//            user = new User();
//            user.setName(request.getName());
//            user.setEmail(request.getEmail());
//            user.setPassword(passwordEncoder.encode(request.getPassword()));
//            user.setRole(request.getRole());
//        }
//
//        userRepository.save(user);
//    }
//
//    // ✅ Login API
//    public LoginResponse login(LoginRequest request) {
//        User user = userRepository.findByEmail(request.getEmail())
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//            throw new RuntimeException("Invalid password");
//        }
//
//        // Doctor approval check
//        if ("doctor".equalsIgnoreCase(user.getRole()) && user instanceof Doctor) {
//            Doctor doctor = (Doctor) user;
//            if (!doctor.isApproved()) {
//                throw new RuntimeException("Doctor account not approved yet");
//            }
//        }
//
//        // Generate JWT token
//        String token = jwtConfig.generateToken(user.getEmail());
//
//        return new LoginResponse(user.getEmail(), user.getRole().toUpperCase(), token);
//    }
//}

package com.example.hms.service;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.hms.config.JwtConfig;
import com.example.hms.dto.LoginRequest;
import com.example.hms.dto.LoginResponse;
import com.example.hms.dto.RegisterRequest;
import com.example.hms.entity.Doctor;
import com.example.hms.entity.Patient;
import com.example.hms.entity.User;
import com.example.hms.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtConfig jwtConfig;

    // Register user
    public void register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user;
        if ("doctor".equalsIgnoreCase(request.getRole())) {
            Doctor doctor = new Doctor();
            doctor.setName(request.getName());
            doctor.setEmail(request.getEmail());
            doctor.setPassword(passwordEncoder.encode(request.getPassword()));
            doctor.setRole("DOCTOR");
            doctor.setPhone(request.getPhone());
            doctor.setQualification(request.getQualification());
            doctor.setExperience(request.getExperience());
            doctor.setSpecialization(request.getSpecialization());
            doctor.setApproved(true); // auto approve for demo
            user = doctor;

        } else if ("patient".equalsIgnoreCase(request.getRole())) {
            Patient patient = new Patient();
            patient.setName(request.getName());
            patient.setEmail(request.getEmail());
            patient.setPassword(passwordEncoder.encode(request.getPassword()));
            patient.setRole("PATIENT");

            try {
                if (request.getDob() != null && !request.getDob().isEmpty()) {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    Date dob = sdf.parse(request.getDob());
                    patient.setDob(dob);
                }
            } catch (Exception e) {
                throw new RuntimeException("Invalid date format. Expected yyyy-MM-dd");
            }

            patient.setMobile(request.getMobile());
            patient.setGender(request.getGender());
            user = patient;

        } else {
            // Admin
            User admin = new User();
            admin.setName(request.getName());
            admin.setEmail(request.getEmail());
            admin.setPassword(passwordEncoder.encode(request.getPassword()));
            admin.setRole("ADMIN");
            user = admin;
        }

        userRepository.save(user);
    }

    // Login user
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Doctor approval check
        if ("DOCTOR".equalsIgnoreCase(user.getRole()) && user instanceof Doctor) {
            Doctor doctor = (Doctor) user;
            if (!doctor.isApproved()) {
                throw new RuntimeException("Doctor account not approved yet");
            }
        }

        // JWT token with role
        String token = jwtConfig.generateToken(user.getEmail(), user.getRole());

        return new LoginResponse(user.getEmail(), user.getRole(), token);
    }
}

