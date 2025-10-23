package com.medicare.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ZoomService {

    @Value("${zoom.client-id}")
    private String clientId;

    @Value("${zoom.client-secret}")
    private String clientSecret;

    @Value("${zoom.account-id}")
    private String accountId;

    private final RestTemplate restTemplate = new RestTemplate();

    private String getAccessToken() {
        String url = "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" + accountId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(clientId, clientSecret);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

        System.out.println("Zoom Auth Response: " + response.getBody());  // 👈 DEBUG THIS

        JSONObject json = new JSONObject(response.getBody());
        if (!json.has("access_token")) {
            throw new RuntimeException("Zoom did not return access_token. Full Response: " + json);
        }

        return json.getString("access_token");
    }


    public String createZoomMeeting(String topic, LocalDateTime startTime, int durationMinutes) {
        String accessToken = getAccessToken();
        String url = "https://api.zoom.us/v2/users/me/meetings";

        JSONObject payload = new JSONObject();
        payload.put("topic", topic);
        payload.put("type", 2); // Scheduled meeting (must be type=2 for future meeting)
        payload.put("start_time", startTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "Z"); // 👈 ADD 'Z' FOR UTC
        payload.put("duration", durationMinutes);
        payload.put("timezone", "Asia/Kolkata");

        JSONObject settings = new JSONObject();
        settings.put("join_before_host", true);
        settings.put("waiting_room", false);
        payload.put("settings", settings);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        HttpEntity<String> entity = new HttpEntity<>(payload.toString(), headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        System.out.println("Zoom Create Meeting Response: " + response.getBody());  // 👈 PRINT THIS

        JSONObject json = new JSONObject(response.getBody());
        if (!json.has("join_url")) {
            throw new RuntimeException("Zoom did not return join_url. Full Response: " + json);
        }

        return json.getString("join_url"); 
    }

}
