package com.medicare.service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.ListItem;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.medicare.entity.MedicineItem;
import com.medicare.entity.Prescription;

@Service
public class PrescriptionPdfGenerator {
	
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm, dd-MM-yyyy");
	
    public byte[] generatePdf(Prescription prescription) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();
            
            // App name at the top-center in big font
            Font appNameFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 24);
            Paragraph appName = new Paragraph("MEDICARE ONLINE", appNameFont);
            appName.setAlignment(Element.ALIGN_CENTER);
            document.add(appName);
            document.add(Chunk.NEWLINE);


            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Prescription", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // Patient info
            document.add(new Paragraph("Patient: " + prescription.getAppointment().getPatient().getUser().getFullName()));
            document.add(new Paragraph("Gender: " + prescription.getAppointment().getPatient().getGender()));
            document.add(new Paragraph("Date of Birth: " + prescription.getAppointment().getPatient().getDateOfBirth()));
            document.add(Chunk.NEWLINE);

            // Doctor info
            document.add(new Paragraph("Doctor: " + prescription.getAppointment().getDoctor().getUser().getFullName()));
            document.add(new Paragraph("Specialization: " + prescription.getAppointment().getDoctor().getSpecialization()));
            document.add(Chunk.NEWLINE);

            // Appointment info
            String formattedAppt = prescription.getAppointment().getScheduledDateTime()
                    .format(DATE_TIME_FORMAT);
            document.add(new Paragraph("Appointment Date & Time: " + formattedAppt));
            document.add(Chunk.NEWLINE);

            // Prescription
            document.add(new Paragraph("Diagnosis: " + prescription.getDiagnosis()));
            document.add(Chunk.NEWLINE);

            com.lowagie.text.List medicineList = new com.lowagie.text.List(false, false, 10);
            for (MedicineItem med : prescription.getMedicines()) {
                medicineList.add(new ListItem(med.getName() + ", Dosage: " + med.getDosage()
                			+ ", Frequency: " + med.getFrequency()+ ", Duration: " + med.getDuration()));
            }
            document.add(new Paragraph("Medicines:"));
            document.add(medicineList);
            document.add(Chunk.NEWLINE);

            if (prescription.getAdditionalNotes() != null) {
                document.add(new Paragraph("Additional Notes: " + prescription.getAdditionalNotes()));
                document.add(Chunk.NEWLINE);
            }
            
            String formattedIssued = prescription.getIssuedAt().format(DATE_TIME_FORMAT);
            document.add(new Paragraph("Issued At: " + formattedIssued));

            document.close();

            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}
