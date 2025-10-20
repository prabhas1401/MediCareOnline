package com.example.hms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hms.entity.Bill;
import com.example.hms.service.BillingService;

@RestController
@RequestMapping("/api/admin/billings")
public class AdminBillingController {

    @Autowired
    private BillingService billingService;

    @GetMapping
    public ResponseEntity<List<Bill>> getAllBillings() {
        return ResponseEntity.ok(billingService.getAllBillings());
    }

    // Add more endpoints as needed
}