package com.medicare.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medicare.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>{
	Optional<User> findByEmailId(String emailId);
    Boolean existsByEmailId(String emailId);
    Boolean existsByPhoneNumber(String phoneNumber);
    List<User> findByRoleAndStatus(User.Role role, User.Status status);
	Optional<User> findByVerificationToken(String token);
}
