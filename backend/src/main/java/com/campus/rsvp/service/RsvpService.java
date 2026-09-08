package com.campus.rsvp.service;

import com.campus.rsvp.dto.EventResponse;
import com.campus.rsvp.dto.RegistrationRequest;
import com.campus.rsvp.dto.RegistrationResponse;
import com.campus.rsvp.exception.DuplicateRegistrationException;
import com.campus.rsvp.exception.ResourceNotFoundException;
import com.campus.rsvp.exception.SeatExceededException;
import com.campus.rsvp.model.CampusEvent;
import com.campus.rsvp.model.Registration;
import com.campus.rsvp.repository.CampusEventRepository;
import com.campus.rsvp.repository.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RsvpService {

    private final CampusEventRepository eventRepository;
    private final RegistrationRepository registrationRepository;

    public RsvpService(CampusEventRepository eventRepository, RegistrationRepository registrationRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
    }

    // Browse all upcoming workshops with seat & status badges
    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByEventDateAsc().stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(Integer id) {
        CampusEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + id));
        return mapToEventResponse(event);
    }

    // Atomic seat reservation with duplicate email detection & capacity enforcement
    @Transactional
    public RegistrationResponse reserveSeat(RegistrationRequest request) {
        CampusEvent event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + request.getEventId()));

        String normalizedEmail = request.getAttendeeEmail().trim().toLowerCase();

        // 1. Duplicate email detection per workshop
        if (registrationRepository.existsByCampusEventIdAndAttendeeEmail(event.getId(), normalizedEmail)) {
            throw new DuplicateRegistrationException(
                    "Registration rejected: The email '" + normalizedEmail + "' is already registered for '" + event.getTitle() + "'."
            );
        }

        // 2. Capacity headroom verification
        if (!event.hasAvailableSeats(request.getTickets())) {
            throw new SeatExceededException(
                    "Capacity full: Requested " + request.getTickets() + " seat(s), but only " + 
                    event.getAvailableSeats() + " seat(s) remain for '" + event.getTitle() + "'."
            );
        }

        // 3. Persist registration record
        Registration registration = new Registration(
                event,
                request.getAttendeeName().trim(),
                normalizedEmail,
                request.getDepartment().trim(),
                request.getTickets()
        );
        Registration savedRegistration = registrationRepository.save(registration);

        // 4. Update event registered seat count atomically
        event.incrementSeats(request.getTickets());
        eventRepository.save(event);

        return new RegistrationResponse(
                savedRegistration.getId(),
                event.getId(),
                event.getTitle(),
                savedRegistration.getAttendeeName(),
                savedRegistration.getAttendeeEmail(),
                savedRegistration.getDepartment(),
                savedRegistration.getTickets(),
                savedRegistration.getRegisteredAt(),
                event.getAvailableSeats(),
                "RSVP Confirmed! " + request.getTickets() + " seat(s) successfully reserved for " + event.getTitle()
        );
    }

    // Live attendee headcount roster
    @Transactional(readOnly = true)
    public List<RegistrationResponse> getRegistrations(Integer eventId) {
        List<Registration> registrations;
        if (eventId != null) {
            registrations = registrationRepository.findByCampusEventIdOrderByRegisteredAtDesc(eventId);
        } else {
            registrations = registrationRepository.findAllByOrderByRegisteredAtDesc();
        }

        return registrations.stream().map(reg -> new RegistrationResponse(
                reg.getId(),
                reg.getCampusEvent().getId(),
                reg.getCampusEvent().getTitle(),
                reg.getAttendeeName(),
                reg.getAttendeeEmail(),
                reg.getDepartment(),
                reg.getTickets(),
                reg.getRegisteredAt(),
                reg.getCampusEvent().getAvailableSeats(),
                "Active"
        )).collect(Collectors.toList());
    }

    // Cancel reservation & free up seats
    @Transactional
    public void cancelRegistration(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with ID: " + registrationId));

        CampusEvent event = registration.getCampusEvent();
        int ticketsToRestore = registration.getTickets();

        // Remove registration
        registrationRepository.delete(registration);

        // Restore seats
        event.decrementSeats(ticketsToRestore);
        eventRepository.save(event);
    }

    private EventResponse mapToEventResponse(CampusEvent event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getSpeakerName(),
                event.getSpeakerTitle(),
                event.getDepartment(),
                event.getVenue(),
                event.getEventDate(),
                event.getTotalSeats(),
                event.getRegisteredSeats()
        );
    }
}
