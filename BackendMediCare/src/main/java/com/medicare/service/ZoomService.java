
package com.medicare.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ZoomService {

    @Value("${zoom.account-id}")  // Updated to match your property name
    private String accountId;

    @Value("${zoom.client-id}")  // Updated to match your property name
    private String clientId;

    @Value("${zoom.client-secret}")  // Updated to match your property name
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Get access token using Server-to-Server OAuth
    private String getAccessToken() {
        try {
            String tokenUrl = "https://zoom.us/oauth/token";

            // Create Basic Auth header
            String auth = clientId + ":" + clientSecret;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "Basic " + encodedAuth);

            // Request body
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "account_credentials");
            body.add("account_id", accountId);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(tokenUrl, HttpMethod.POST, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return jsonNode.get("access_token").asText();
            } else {
                log.error("Failed to get Zoom access token: {}", response.getBody());
                throw new RuntimeException("Failed to get Zoom access token: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error getting Zoom access token: {}", e.getMessage(), e);
            throw new RuntimeException("Could not get Zoom access token: " + e.getMessage());
        }
    }

    // Create a Zoom meeting
    public String createZoomMeeting(String topic, LocalDateTime startTime, int durationMinutes) {
        try {
            String accessToken = getAccessToken();
            String meetingUrl = "https://api.zoom.us/v2/users/me/meetings";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + accessToken);

            // Meeting details
            Map<String, Object> meetingDetails = new HashMap<>();
            meetingDetails.put("topic", topic);
            meetingDetails.put("type", 2);  // Scheduled meeting
            meetingDetails.put("start_time", startTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "Z");  // ISO format with Z
            meetingDetails.put("duration", durationMinutes);
            meetingDetails.put("timezone", "UTC");
            meetingDetails.put("agenda", "Medical Consultation");
            meetingDetails.put("settings", Map.of(
                "host_video", true,
                "participant_video", true,
                "join_before_host", false,
                "mute_upon_entry", true,
                "watermark", false,
                "use_pmi", false,
                "approval_type", 0,
                "audio", "both",
                "auto_recording", "none"
            ));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(meetingDetails, headers);

            ResponseEntity<String> response = restTemplate.exchange(meetingUrl, HttpMethod.POST, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                String joinUrl = jsonNode.get("join_url").asText();
                log.info("Zoom meeting created successfully: {}", joinUrl);
                return joinUrl;
            } else {
                log.error("Failed to create Zoom meeting: {}", response.getBody());
                throw new RuntimeException("Failed to create Zoom meeting: " + response.getStatusCode() + " - " + response.getBody());
            }
        } catch (Exception e) {
            log.error("Error creating Zoom meeting: {}", e.getMessage(), e);
            throw new RuntimeException("Could not generate Zoom link: " + e.getMessage());
        }
    }
}