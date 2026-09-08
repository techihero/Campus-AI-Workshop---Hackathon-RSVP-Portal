package com.campus.rsvp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "campus_events")
public class CampusEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "speaker_name", nullable = false, length = 100)
    private String speakerName;

    @Column(name = "speaker_title", nullable = false, length = 120)
    private String speakerTitle;

    @Column(nullable = false, length = 80)
    private String department;

    @Column(nullable = false, length = 120)
    private String venue;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Column(name = "registered_seats", nullable = false)
    private Integer registeredSeats = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "campusEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Registration> registrations = new ArrayList<>();

    public CampusEvent() {
    }

    public CampusEvent(Integer id, String title, String description, String speakerName, 
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
        this.createdAt = LocalDateTime.now();
    }

    // Helper methods
    public int getAvailableSeats() {
        return Math.max(0, totalSeats - registeredSeats);
    }

    public boolean hasAvailableSeats(int requestedTickets) {
        return (registeredSeats + requestedTickets) <= totalSeats;
    }

    public void incrementSeats(int tickets) {
        this.registeredSeats += tickets;
    }

    public void decrementSeats(int tickets) {
        this.registeredSeats = Math.max(0, this.registeredSeats - tickets);
    }

    // Getters and Setters
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Registration> getRegistrations() {
        return registrations;
    }

    public void setRegistrations(List<Registration> registrations) {
        this.registrations = registrations;
    }
}
