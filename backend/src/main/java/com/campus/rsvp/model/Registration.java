package com.campus.rsvp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "registrations",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_event_email", columnNames = {"event_id", "attendee_email"})
    }
)
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private CampusEvent campusEvent;

    @Column(name = "attendee_name", nullable = false, length = 100)
    private String attendeeName;

    @Column(name = "attendee_email", nullable = false, length = 150)
    private String attendeeEmail;

    @Column(nullable = false, length = 80)
    private String department;

    @Column(nullable = false)
    private Integer tickets = 1;

    @Column(name = "registered_at", updatable = false)
    private LocalDateTime registeredAt = LocalDateTime.now();

    public Registration() {
    }

    public Registration(CampusEvent campusEvent, String attendeeName, String attendeeEmail, 
                        String department, Integer tickets) {
        this.campusEvent = campusEvent;
        this.attendeeName = attendeeName;
        this.attendeeEmail = attendeeEmail;
        this.department = department;
        this.tickets = tickets;
        this.registeredAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CampusEvent getCampusEvent() {
        return campusEvent;
    }

    public void setCampusEvent(CampusEvent campusEvent) {
        this.campusEvent = campusEvent;
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
}
