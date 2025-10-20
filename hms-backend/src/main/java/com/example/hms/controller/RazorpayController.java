package com.example.hms.controller;

import java.util.HashMap;
import java.util.Map;
import org.json.JSONObject;

import com.razorpay.Order;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.RazorpayClient;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class RazorpayController {

	@Value("${razorpay.keyId}")
	private String keyId;

	@Value("${razorpay.keySecret}")
	private String keySecret;


    @PostMapping("/create-order")
    public Map<String, Object> createOrder(@RequestBody Map<String, Object> data) {
        try {
            int amount = (int) data.get("amount"); // amount in paise
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

//            Map<String, Object> options = new HashMap<>();
//            options.put("amount", amount); // e.g., 50000 paise = ₹500
//            options.put("currency", "INR");
//            options.put("payment_capture", 1);
//
//            Order order = client.Orders.create(options);
            JSONObject options = new JSONObject();
            options.put("amount", amount);
            options.put("currency", "INR");
            options.put("payment_capture", 1);

            Order order = client.Orders.create(options);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("key", keyId);

            return response;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error creating Razorpay order");
        }
    }
}
