package com.example.hms.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hms.entity.Bill;

public interface BillRepository extends JpaRepository<Bill, Long> {
}