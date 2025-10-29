
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
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayService {

    @Value("${razorpay.keyId}")
    private String keyId;

    @Value("${razorpay.keySecret}")
    private String keySecret;

    private RazorpayClient client;

    private RazorpayClient getClient() throws RazorpayException {
        if (client == null) {
            client = new RazorpayClient(keyId, keySecret);
        }
        return client;
    }

    public Map<String, Object> createOrder(Long patientId, PaymentInitRequest req) throws RazorpayException {
        RazorpayClient client = getClient();

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

    public String getPaymentMethod(String paymentId) {
        try {
            RazorpayClient client = getClient();
            com.razorpay.Payment payment = client.payments.fetch(paymentId);
            return payment.get("method").toString();
        } catch (RazorpayException e) {
            log.error("Failed to fetch payment method for paymentId: {}", paymentId, e);
            throw new RuntimeException("Failed to fetch payment method from Razorpay", e);
        }
    }

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
            String expectedSignature = hmacSha256(payload, keySecret);

            // Handle if signature is sent as hex (convert to base64)
            String receivedSignature = signature;
            if (signature.length() == 64 && signature.matches("[0-9a-fA-F]+")) {
                byte[] bytes = hexStringToByteArray(signature);
                receivedSignature = Base64.getEncoder().encodeToString(bytes);
            }

            boolean isValid = expectedSignature.equals(receivedSignature);
            if (!isValid) {
                log.warn("Signature verification failed. OrderId: {}, PaymentId: {}, Expected: {}, Received: {}", 
                         orderId, paymentId, expectedSignature, receivedSignature);
            }
            return isValid;
        } catch (Exception e) {
            log.error("Error during signature verification for OrderId: {}, PaymentId: {}", orderId, paymentId, e);
            return false;
        }
    }

    private String hmacSha256(String payload, String secret) throws Exception {
        Mac sha256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        sha256.init(secretKey);
        return Base64.getEncoder().encodeToString(sha256.doFinal(payload.getBytes()));
    }

    private byte[] hexStringToByteArray(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                                 + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}
