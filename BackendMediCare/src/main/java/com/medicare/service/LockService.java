package com.medicare.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.medicare.entity.Appointment;

/**
 * LockService centralizes lock creation/validation/release logic.
 * - Lock is represented by appointment.lockedBy and appointment.lockExpiry
 * - Timeout is 10 minutes (per story)
 */
@Service
public class LockService {

    // Lock timeout in minutes; story requires 10 minutes.
    private static final long LOCK_TIMEOUT_MINUTES = 10L;

    /**
     * Apply a lock to the appointment for actingUserId.
     * This simply sets lock owner and expiry timestamp.
     */
    public void applyLock(Appointment appointment, Long actingUserId) {
        appointment.setLockedBy(actingUserId); // who holds the lock
        appointment.setLockExpiry(LocalDateTime.now().plusMinutes(LOCK_TIMEOUT_MINUTES)); // when it expires
    }

    /**
     * Returns true if the lock is present and not expired.
     */
    public boolean isLockedAndActive(Appointment appointment) {
        Long lockedBy = appointment.getLockedBy();
        LocalDateTime expiry = appointment.getLockExpiry();
        return lockedBy != null && expiry != null && expiry.isAfter(LocalDateTime.now());
    }

    /**
     * Returns true if the lock existed but is expired.
     */
    public boolean isLockExpired(Appointment appointment) {
        LocalDateTime expiry = appointment.getLockExpiry();
        return expiry != null && expiry.isBefore(LocalDateTime.now());
    }

    /**
     * Release lock fields.
     */
    public void releaseLock(Appointment appointment) {
        appointment.setLockedBy(null);
        appointment.setLockExpiry(null);
    }
}
