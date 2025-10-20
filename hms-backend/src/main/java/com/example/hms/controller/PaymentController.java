package com.example.hms.controller;

import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

@RestController
@CrossOrigin(origins = "*")
public class PaymentController {

	@Value("${razorpay.keyId}")
	private String razorpayKey;

	@Value("${razorpay.keySecret}")
	private String razorpaySecret;


    // Create Razorpay order
    @PostMapping("/payment/create-order")
    public Map<String, String> createOrder(@RequestBody Map<String, Object> data) throws RazorpayException {
        int amount = (int) data.get("amount"); // amount in paise

        RazorpayClient client = new RazorpayClient(razorpayKey, razorpaySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount); // in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("payment_capture", 1); // auto-capture

        Order order = client.Orders.create(orderRequest);

        Map<String, String> response = new HashMap<>();
        response.put("orderId", order.get("id"));
        response.put("key", razorpayKey);
        response.put("currency", order.get("currency"));
        return response;
    }
}
