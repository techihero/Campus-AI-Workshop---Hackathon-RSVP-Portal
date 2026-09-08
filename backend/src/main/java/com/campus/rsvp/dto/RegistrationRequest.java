package com.campus.rsvp.dto;

import jakarta.validation.constraints.*;

public class RegistrationRequest {

    @NotNull(message = "Event ID is required")
    private Integer eventId;

    @NotBlank(message = "Attendee name is required")
    @Size(min = 2, max = 100, message = "Attendee name must be between 2 and 100 characters")
    private String attendeeName;

    @NotBlank(message = "Attendee email is required")
    @Email(message = "Please provide a valid college email address")
    @Size(max = 150, message = "Email cannot exceed 150 characters")
    private String attendeeEmail;

    @NotBlank(message = "Department is required")
    @Size(max = 80, message = "Department cannot exceed 80 characters")
    private String department;

    @NotNull(message = "Ticket count is required")
    @Min(value = 1, message = "Minimum ticket count is 1 seat")
    @Max(value = 2, message = "Maximum ticket count is 2 seats per student")
    private Integer tickets = 1;

    public RegistrationRequest() {
    }

    public RegistrationRequest(Integer eventId, String attendeeName, String attendeeEmail, 
                               String department, Integer tickets) {
        this.eventId = eventId;
        this.attendeeName = attendeeName;
        this.attendeeEmail = attendeeEmail;
        this.department = department;
        this.tickets = tickets;
    }

    public Integer getEventId() {
        return eventId;
    }

    public void setEventId(Integer eventId) {
        this.eventId = eventId;
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
}
