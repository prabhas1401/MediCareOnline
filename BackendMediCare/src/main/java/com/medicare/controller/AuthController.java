package com.medicare.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.medicare.dto.AuthResponse;
import com.medicare.dto.EmailRequest;
import com.medicare.dto.LoginRequest;
import com.medicare.dto.RegisterPatientRequest;
import com.medicare.dto.RegisterRequest;
import com.medicare.dto.RegisterResponse;
import com.medicare.dto.ResetPasswordRequest;
import com.medicare.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * AuthController:
 * - Public endpoints for register, login, verify, forgot/reset password
 * - Admin creation endpoint is protected by ROLE_ADMIN (only active admins can call)
 *
 * NOTE:
 * - Frontend will perform confirm-password matching and send only `rawPassword`.
 * - Forgot-password:
 *     1) frontend shows email form (public) -> POST /api/auth/forgot-password with { email }
 *     2) backend emails token link to user
 *     3) user clicks link -> frontend shows reset page to set new password (frontend validates)
 *     4) frontend sends token + newPassword to backend POST /api/auth/reset-password
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    

    // ----------------------
    // Registration & login
    // ----------------------

    @PostMapping("/register/patient")			//Done
    public ResponseEntity<RegisterResponse> registerPatient(@Valid @RequestBody RegisterPatientRequest req) {
        RegisterResponse res = authService.registerPatient(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/register/doctor")			//Done
    public ResponseEntity<RegisterResponse> registerDoctor(@Valid @RequestBody RegisterRequest req) {
        RegisterResponse res = authService.registerDoctor(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/login")						//Done
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse res = authService.login(req);
        return ResponseEntity.ok(res);
    }

    // ----------------------
    // Verification & password reset
    // ----------------------

    /**
     * Email verification link used by frontend.
     * - This is a public GET endpoint because the token reaches here via email link.
     * - Frontend will call this endpoint (or backend can simply render html and redirect).
     */
    @GetMapping("/verify")			//Done
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok("Email verified successfully. You may now log in.");
    }

    /**
     * Forgot password: UI posts email here. Backend sends password-reset email with token.
     * Public endpoint.
     */
    @PostMapping("/forgot-password")		//Done
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody EmailRequest emailRequest) {
        authService.forgotPassword(emailRequest.getEmail());
        return ResponseEntity.ok("Password reset link has been sent to the provided email (if it exists).");
    }

    /**
     * Reset password:
     * - Accepts token + newPassword (frontend ensures confirm-password matched).
     * - Public endpoint because the token is the auth here.
     */
    @PostMapping("/reset-password")			//Done
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok("Password reset successful. You can now log in with your new password.");
    }
}
