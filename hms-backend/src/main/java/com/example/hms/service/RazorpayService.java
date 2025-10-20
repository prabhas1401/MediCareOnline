package com.example.hms.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;

@Service
public class RazorpayService {

	@Value("${razorpay.keyId}")
	private String keyId;

	@Value("${razorpay.keySecret}")
	private String keySecret;


    public JSONObject createOrder(int amountInPaise) throws Exception {
        RazorpayClient client = new RazorpayClient(keyId, keySecret);
        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise); // amount in paise
        options.put("currency", "INR");
        options.put("payment_capture", 1); // auto capture
        Order order = client.Orders.create(options);
        JSONObject response = new JSONObject();
        response.put("orderId", order.get("id"));
        response.put("amount", order.get("amount"));
        response.put("currency", order.get("currency"));
        response.put("key", keyId);
        return response;
    }
}
