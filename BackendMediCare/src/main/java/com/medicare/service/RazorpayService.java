package com.medicare.service;

import java.util.Base64;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.medicare.dto.PaymentInitRequest;
import com.medicare.entity.Payment;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class RazorpayService {

    @Value("${razorpay.keyId}")
    private String keyId;

    @Value("${razorpay.keySecret}")
    private String keySecret;

    public Map<String, Object> createOrder(Long patientId, PaymentInitRequest req) throws RazorpayException {
        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", 500 * 100);
        orderRequest.put("currency", "INR");

        Order order = client.orders.create(orderRequest);

        return Map.of(
                "orderId", order.get("id"),
                "amount", order.get("amount"),
                "currency", "INR",
                "patientId", patientId
        );
    }
    
    
    // NEW: Fetch payment method from Razorpay
    public String getPaymentMethod(String paymentId) {
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            com.razorpay.Payment payment = client.payments.fetch(paymentId); // <-- full name here
            return payment.get("method");
        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to fetch payment method from Razorpay", e);
        }
    }


    // NEW: Map Razorpay method string to Payment.Method
    public Payment.Method mapRazorpayMethod(String razorpayMethod) {
        if (razorpayMethod == null) return Payment.Method.CARD;
        switch (razorpayMethod.toLowerCase()) {
            case "upi": return Payment.Method.UPI;
            case "card": return Payment.Method.CARD;
            case "netbanking": return Payment.Method.BANK_TRANSFER;
            case "wallet":
            case "qr": return Payment.Method.QR;
            default: return Payment.Method.CARD;
        }
    }


    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            String expected = hmacSha256(payload, keySecret);
            return expected.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    private String hmacSha256(String payload, String secret) throws Exception {
        Mac sha256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        sha256.init(secretKey);
        return Base64.getEncoder().encodeToString(sha256.doFinal(payload.getBytes()));
    }
}
