package com.campus.rsvp.dto;

import java.time.LocalDateTime;

public class RegistrationResponse {

    private Long id;
    private Integer eventId;
    private String eventTitle;
    private String attendeeName;
    private String attendeeEmail;
    private String department;
    private Integer tickets;
    private LocalDateTime registeredAt;
    private Integer remainingSeats;
    private String confirmationMessage;

    public RegistrationResponse() {
    }

    public RegistrationResponse(Long id, Integer eventId, String eventTitle, String attendeeName, 
                                String attendeeEmail, String department, Integer tickets, 
                                LocalDateTime registeredAt, Integer remainingSeats, 
                                String confirmationMessage) {
        this.id = id;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.attendeeName = attendeeName;
        this.attendeeEmail = attendeeEmail;
        this.department = department;
        this.tickets = tickets;
        this.registeredAt = registeredAt;
        this.remainingSeats = remainingSeats;
        this.confirmationMessage = confirmationMessage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getEventId() {
        return eventId;
    }

    public void setEventId(Integer eventId) {
        this.eventId = eventId;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }

    public String getAttendeeName() {
        return attendeeName;
    }

    public void setAttendeeName(String attendeeName) {
        this.attendeeName = attendeeName;
    }

    public String getAttendeeEmail() {
        return attendeeEmail;
    }

    public void setAttendeeEmail(String attendeeEmail) {
        this.attendeeEmail = attendeeEmail;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getTickets() {
        return tickets;
    }

    public void setTickets(Integer tickets) {
        this.tickets = tickets;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public Integer getRemainingSeats() {
        return remainingSeats;
    }

    public void setRemainingSeats(Integer remainingSeats) {
        this.remainingSeats = remainingSeats;
    }

    public String getConfirmationMessage() {
        return confirmationMessage;
    }

    public void setConfirmationMessage(String confirmationMessage) {
        this.confirmationMessage = confirmationMessage;
    }
}
