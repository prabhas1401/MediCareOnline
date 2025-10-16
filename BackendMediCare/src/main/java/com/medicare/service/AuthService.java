package com.medicare.service;

import com.medicare.dto.*;
import com.medicare.entity.*;
import com.medicare.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Central AuthService for MediCare HMS.
 *
 * Responsibilities:
 * - Patient / Doctor self-registration (INACTIVE until verification; doctor still needs admin approval)
 * - Admin creation by a super-admin only
 * - Login (returns JWT from TokenService)
 * - Email verification (DB-token first, fallback to JWT token)
 * - Forgot password / Reset password (token stored in user.verificationToken)
 *
 * NOTE: This class uses simple RuntimeExceptions for error cases; replace with your custom exceptions if desired.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    // repositories
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AdminRepository adminRepository;

    // helpers
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;    // JWT generator/validator (from your prior project)
    private final EmailService emailService;    // concrete SMTP EmailService you provided

    // verification token expiry durations
    @Value("${hms.verification.token.hours:24}")
    private int verificationTokenHours; // default 24 hours

    @Value("${hms.reset.token.hours:1}")
    private int resetTokenHours; // default 1 hour

    // -----------------------
    // Registration flows
    // -----------------------

    /**
     * Register a patient (self-register).
     * - Sets role PATIENT and status INACTIVE
     * - Stores verification token for email verification
     */
    @Transactional
    public RegisterResponse registerPatient(RegisterPatientRequest req) {
        // basic validation: empty password
    	if (req.getRawPassword() == null || req.getRawPassword().isBlank()) {
    	    throw new IllegalArgumentException("Password cannot be empty");
    	}


        // uniqueness checks
        if (userRepository.existsByEmailId(req.getEmailId())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.existsByPhoneNumber(req.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already in use");
        }

        // create User
        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmailId(req.getEmailId());
        user.setPhoneNumber(req.getPhoneNumber());
        user.setPasswordHash(passwordEncoder.encode(req.getRawPassword()));
        user.setRole(User.Role.PATIENT);
        user.setStatus(User.Status.INACTIVE);

        // generate verification token & expiry
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusHours(verificationTokenHours));

        // save user
        User saved = userRepository.save(user);

        // create patient profile placeholder (doctors can create or user can later add patient details)
        Patient patient = new Patient();
        patient.setUser(saved);
        // other patient fields (gender, dob) can be added via PatientService
        // set additional patient info
        patient.setGender(req.getGender());
        patient.setDateOfBirth(req.getDateOfBirth());
        patientRepository.save(patient);

        // send verification email (EmailService sends link containing token)
        emailService.sendVerificationEmail(saved.getEmailId(), token);

        // return response DTO
        return new RegisterResponse(saved.getEmailId(), saved.getStatus().name(),
                "Registered. Check your email and verify to activate your account.");
    }

    /**
     * Register a doctor (self-register).
     * - Sets role DOCTOR and status INACTIVE (email verified step still required)
     * - Admin must later approve to make the account ACTIVE for scheduling
     */
    @Transactional
    public RegisterResponse registerDoctor(RegisterRequest req) {
        // password checks
    	if (req.getRawPassword() == null || req.getRawPassword().isBlank()) {
    	    throw new IllegalArgumentException("Password cannot be empty");
    	}

        // uniqueness checks
        if (userRepository.existsByEmailId(req.getEmailId())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.existsByPhoneNumber(req.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already in use");
        }

        // create user
        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmailId(req.getEmailId());
        user.setPhoneNumber(req.getPhoneNumber());
        user.setPasswordHash(passwordEncoder.encode(req.getRawPassword()));
        user.setRole(User.Role.DOCTOR);
        user.setStatus(User.Status.INACTIVE);

        // verification token for email verification
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusHours(verificationTokenHours));

        // save user
        User saved = userRepository.save(user);

        // create doctor profile and fill doctor-specific fields if provided
        Doctor doctor = new Doctor();
        doctor.setUser(saved);
        // only set if provided — controller must supply correct enum parsing for specialization
        if (req.getSpecialization() != null) {
            try {
                Doctor.Specialization spec = Doctor.Specialization.valueOf(req.getSpecialization());
                doctor.setSpecialization(spec);
            } catch (IllegalArgumentException ex) {
            	throw new IllegalArgumentException("Invalid specialization value: " + req.getSpecialization(), ex);
            }
        }
        doctor.setQualification(req.getQualification());
        doctor.setExperienceYears(req.getExperienceYears());
        doctorRepository.save(doctor);

        // send verification email
        emailService.sendVerificationEmail(saved.getEmailId(), token);

        return new RegisterResponse(saved.getEmailId(), saved.getStatus().name(),
                "Doctor registered. Verify email. Admin must approve account before scheduling.");
    }

    /**
     * Create admin user (only callable by an existing super-admin)
     * - performedByAdminUserId: id of the admin performing creation (must be super-admin)
     */
    @Transactional
    public RegisterResponse registerAdmin(AdminRegistrationRequest req, Long performedByAdminUserId) {
        // validate performedBy admin exists and is superAdmin
        Admin creator = adminRepository.findByUserId(performedByAdminUserId)
                .orElseThrow(() -> new IllegalArgumentException("Creator admin not found"));
        if (!creator.isSuperAdmin()) {
            throw new IllegalArgumentException("Only super-admin may create new admins");
        }

        // password checks
        if (req.getRawPassword() == null || req.getRawPassword().isBlank()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }


        // uniqueness checks
        if (userRepository.existsByEmailId(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.existsByPhoneNumber(req.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already in use");
        }

        // create user
        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmailId(req.getEmail());
        user.setPhoneNumber(req.getPhoneNumber());
        user.setPasswordHash(passwordEncoder.encode(req.getRawPassword()));
        user.setRole(User.Role.ADMIN);
        user.setStatus(User.Status.ACTIVE); // Admins created by super-admin are active immediately

        User saved = userRepository.save(user);

        // create Admin record and mark superAdmin flag as requested
        Admin admin = new Admin();
        admin.setUser(saved);
        admin.setSuperAdmin(req.isSuperAdmin());
        adminRepository.save(admin);

        // no verification email necessary for admin by story, but you might still inform them
        emailService.sendVerificationEmail(saved.getEmailId(), UUID.randomUUID().toString()); // optional: can be removed

        return new RegisterResponse(saved.getEmailId(), saved.getStatus().name(),
                "Admin created successfully.");
    }

    // -----------------------
    // Login / Auth
    // -----------------------

    /**
     * Login user and return JWT token + meta.
     * Only users with status ACTIVE are allowed to login.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        // find user by email (identifier)
        User user = userRepository.findByEmailId(req.getIdentifier())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        // verify password
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        // check status (only ACTIVE allowed)
        if (user.getStatus() != User.Status.ACTIVE) {
            throw new IllegalArgumentException("User account is not active");
        }

        // generate JWT token using TokenService (returns signed JWT)
        String jwt = tokenService.generateToken(user);

        // return DTO
        return new AuthResponse(jwt, user.getRole().name(), user.getUserId(), user.getFullName());
    }

    // -----------------------
    // Verification & Password reset flows
    // -----------------------

    /**
     * Verify email using token.
     *
     * Flow:
     * 1) Try find user by DB-stored verificationToken first (preferred).
     * 2) If not found, attempt to treat token as JWT: validate JWT & extract user id.
     *
     * After successful verification:
     * - set user.status = ACTIVE (for PATIENT)
     * - for DOCTOR, set status = INACTIVE if admin approval is still required (keep INACTIVE)
     *   BUT here we'll set to ACTIVE only if user.role == PATIENT (doctors still require admin approval).
     *
     * Returns the activated user.
     */
    @Transactional
    public User verifyEmail(String token) {
        // attempt 1: DB token lookup
        Optional<User> userOpt = userRepository.findByVerificationToken(token);

        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            // check expiry
            if (user.getTokenExpiry() == null || user.getTokenExpiry().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Verification token expired");
            }
        } else {
            // attempt 2: treat token as JWT
            if (!tokenService.validateToken(token)) {
                throw new IllegalArgumentException("Invalid verification token");
            }
            Long userId = tokenService.getUserIdFromToken(token);
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found for token"));
        }

        // now apply story rules:
        // - Patients become ACTIVE after verification.
        // - Doctors remain INACTIVE until admin approval (so we set verification cleared but status remains INACTIVE).
        if (user.getRole() == User.Role.PATIENT) {
            user.setStatus(User.Status.ACTIVE);
        } else if (user.getRole() == User.Role.DOCTOR) {
            // Clear verification token but keep status INACTIVE awaiting admin approval
            user.setStatus(User.Status.INACTIVE);
        } else if (user.getRole() == User.Role.ADMIN) {
            // unlikely because admin created by admin; but if found, activate
            user.setStatus(User.Status.ACTIVE);
        }

        // clear tokens
        user.setVerificationToken(null);
        user.setTokenExpiry(null);

        return userRepository.save(user);
    }

    /**
     * Request password reset: generates a short-lived verification token and sends reset email.
     */
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmailId(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        // generate short-lived token and store it in verificationToken field
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusHours(resetTokenHours));
        userRepository.save(user);

        // send password reset email (link contains token)
        emailService.sendPasswordResetEmail(user.getEmailId(), token);
    }

    /**
     * Reset password using token previously generated by forgotPassword().
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // find user by token
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        // check expiry
        if (user.getTokenExpiry() == null || user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token expired");
        }

        // set new password and clear tokens
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setVerificationToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
    }

    // -----------------------
    // Admin-only actions
    // -----------------------

    /**
     * Approve a doctor: make doctor's user.status ACTIVE (only Admins can do this).
     * The caller should be validated at controller (we accept adminUserId param and verify).
     */
    @Transactional
    public void approveDoctor(Long doctorUserId, Long actingAdminUserId) {
        // ensure acting admin exists and is active admin
        Admin acting = adminRepository.findByUserId(actingAdminUserId)
                .orElseThrow(() -> new IllegalArgumentException("Acting admin not found"));
        if (!acting.getUser().getStatus().equals(User.Status.ACTIVE)) {
            throw new IllegalArgumentException("Acting admin is not active");
        }

        // find doctor profile
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        User user = doctor.getUser();

        // set user status ACTIVE
        user.setStatus(User.Status.ACTIVE);
        userRepository.save(user);

        // optionally email doctor about approval (you might want a dedicated email)
        emailService.sendAppointmentScheduledEmail(user.getEmailId(), user.getFullName(), "—", "—", LocalDateTime.now(), "");
    }

    /**
     * Block or unblock a user (admin action).
     */
    @Transactional
    public void setUserStatusByAdmin(Long userId, User.Status status, Long actingAdminUserId) {
        // verify acting admin
        Admin acting = adminRepository.findByUserId(actingAdminUserId)
                .orElseThrow(() -> new IllegalArgumentException("Acting admin not found"));
        if (!acting.getUser().getStatus().equals(User.Status.ACTIVE)) {
            throw new IllegalArgumentException("Acting admin is not active");
        }

        // fetch user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
    }
}
