package com.medicare.service;

import java.io.FileInputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.ConferenceData;
import com.google.api.services.calendar.model.ConferenceSolutionKey;
import com.google.api.services.calendar.model.CreateConferenceRequest;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoogleMeetService {

    private static final String APPLICATION_NAME = "MediCare HMS";
    private static final String SERVICE_ACCOUNT_KEY_PATH = "src/main/resources/keys/medicare-service-key.json";
    private static final String CALENDAR_ID = "primary"; // Or use service-account email

    private Calendar getCalendarService() throws Exception {
        GoogleCredential credential = GoogleCredential.fromStream(new FileInputStream(SERVICE_ACCOUNT_KEY_PATH))
                .createScoped(Collections.singleton("https://www.googleapis.com/auth/calendar"));

        return new Calendar.Builder(
                credential.getTransport(),
                credential.getJsonFactory(),
                credential
        ).setApplicationName(APPLICATION_NAME).build();
    }

    public String createGoogleMeetEvent(String title, String description, LocalDateTime start, int durationMinutes) throws Exception {
        Calendar service = getCalendarService();

        Event event = new Event()
                .setSummary(title)
                .setDescription(description);

        Date startDate = Date.from(start.atZone(ZoneId.systemDefault()).toInstant());
        Date endDate = Date.from(start.plusMinutes(durationMinutes).atZone(ZoneId.systemDefault()).toInstant());

        event.setStart(new EventDateTime().setDateTime(new com.google.api.client.util.DateTime(startDate)));
        event.setEnd(new EventDateTime().setDateTime(new com.google.api.client.util.DateTime(endDate)));

        ConferenceData conferenceData = new ConferenceData()
                .setCreateRequest(new CreateConferenceRequest()
                        .setRequestId(UUID.randomUUID().toString())
                        .setConferenceSolutionKey(new ConferenceSolutionKey().setType("hangoutsMeet")));

        event.setConferenceData(conferenceData);

        Event createdEvent = service.events()
                .insert(CALENDAR_ID, event)
                .setConferenceDataVersion(1)
                .execute();

        return createdEvent.getHangoutLink(); // ✅ This is the Google Meet link
    }
}