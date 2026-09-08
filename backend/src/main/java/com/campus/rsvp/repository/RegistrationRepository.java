package com.campus.rsvp.repository;

import com.campus.rsvp.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    // Duplicate email detection per workshop/event
    boolean existsByCampusEventIdAndAttendeeEmail(Integer eventId, String attendeeEmail);

    // Find registrations by event
    List<Registration> findByCampusEventIdOrderByRegisteredAtDesc(Integer eventId);

    // Find all ordered by most recent
    List<Registration> findAllByOrderByRegisteredAtDesc();

    // Find by email across events
    List<Registration> findByAttendeeEmailIgnoreCase(String attendeeEmail);

    // Optional find specific registration for event and email
    Optional<Registration> findByCampusEventIdAndAttendeeEmail(Integer eventId, String attendeeEmail);
}
