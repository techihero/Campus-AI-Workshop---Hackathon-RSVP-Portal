package com.campus.rsvp.dto;

import java.time.LocalDateTime;

public class EventResponse {

    private Integer id;
    private String title;
    private String description;
    private String speakerName;
    private String speakerTitle;
    private String department;
    private String venue;
    private LocalDateTime eventDate;
    private Integer totalSeats;
    private Integer registeredSeats;
    private Integer availableSeats;
    private String status; // "AVAILABLE", "FILLING_FAST", "SOLD_OUT"
    private double percentFilled;

    public EventResponse() {
    }

    public EventResponse(Integer id, String title, String description, String speakerName, 
                         String speakerTitle, String department, String venue, 
                         LocalDateTime eventDate, Integer totalSeats, Integer registeredSeats) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.speakerName = speakerName;
        this.speakerTitle = speakerTitle;
        this.department = department;
        this.venue = venue;
        this.eventDate = eventDate;
        this.totalSeats = totalSeats;
        this.registeredSeats = registeredSeats != null ? registeredSeats : 0;
        this.availableSeats = Math.max(0, totalSeats - this.registeredSeats);
        this.percentFilled = totalSeats > 0 ? ((double) this.registeredSeats / totalSeats) * 100 : 0.0;
        
        if (this.availableSeats == 0) {
            this.status = "SOLD_OUT";
        } else if (this.percentFilled >= 80.0) {
            this.status = "FILLING_FAST";
        } else {
            this.status = "AVAILABLE";
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSpeakerName() {
        return speakerName;
    }

    public void setSpeakerName(String speakerName) {
        this.speakerName = speakerName;
    }

    public String getSpeakerTitle() {
        return speakerTitle;
    }

    public void setSpeakerTitle(String speakerTitle) {
        this.speakerTitle = speakerTitle;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public Integer totalSeats() {
        return totalSeats;
    }

    public Integer getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
    }

    public Integer getRegisteredSeats() {
        return registeredSeats;
    }

    public void setRegisteredSeats(Integer registeredSeats) {
        this.registeredSeats = registeredSeats;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getPercentFilled() {
        return percentFilled;
    }

    public void setPercentFilled(double percentFilled) {
        this.percentFilled = percentFilled;
    }
}
