package com.example.hms.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.hms.entity.Bill;
import com.example.hms.repository.BillRepository;

@Service
public class BillingService {
    @Autowired
    private BillRepository billRepository;

    public List<Bill> getAllBillings() {
        return billRepository.findAll();
    }

    // Add more methods as needed, e.g., update bill status
}