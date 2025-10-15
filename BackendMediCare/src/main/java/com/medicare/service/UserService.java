package com.medicare.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.medicare.entity.User;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.AdminRepository;
import com.medicare.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * UserService handles registration, verification and user-level admin actions.
 * - Patients / Doctors register => INACTIVE until verification (and doctor approval for role).
 * - Admins are created by existing Admins (handled by AdminService).
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    /**
     * Register a new user (Patient or Doctor).
     * - Hashes password
     * - Sets INACTIVE
     * - Creates verification token valid for 24 hours
     */
    @Transactional
    public User registerUser(User user, String rawPassword) {
        // Unique email & phone checks
        if (userRepository.existsByEmailId(user.getEmailId())) {
            throw new ConflictException("Email already in use");
        }
        if (userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
            throw new ConflictException("Phone number already in use");
        }

        // store hashed password
        user.setPasswordHash(passwordEncoder.encode(rawPassword));

        // Always start as INACTIVE (story).
        user.setStatus(User.Status.INACTIVE);

        // generate verification token & expiry (24 hours)
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setTokenExpiry(LocalDateTime.now().plusHours(24));

        // save and send verification email
        User saved = userRepository.save(user);
        emailService.sendVerificationEmail(saved.getEmailId(), saved.getVerificationToken());
        return saved;
    }

    /**
     * Verify account using token
     */
    @Transactional
    public User verifyUserByToken(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid token"));

        // check expiry
        if (user.getTokenExpiry() == null || user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ConflictException("Verification token expired");
        }

        // Activate only the account; doctor still needs admin approval to become ACTIVE for doctor actions.
        user.setStatus(User.Status.ACTIVE);
        user.setVerificationToken(null);
        user.setTokenExpiry(null);

        return userRepository.save(user);
    }

    /**
     * Find active users by role
     */
    public List<User> findActiveUsersByRole(User.Role role) {
        return userRepository.findByRoleAndStatus(role, User.Status.ACTIVE);
    }

    /**
     * Block / unblock user (admin action)
     */
    @Transactional
    public User setUserStatus(Long userId, User.Status status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(status);
        return userRepository.save(user);
    }
}
