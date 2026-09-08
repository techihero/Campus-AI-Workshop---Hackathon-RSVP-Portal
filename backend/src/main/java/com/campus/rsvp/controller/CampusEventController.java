package com.campus.rsvp.controller;

import com.campus.rsvp.dto.ApiResponse;
import com.campus.rsvp.dto.EventResponse;
import com.campus.rsvp.service.RsvpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.OPTIONS})
public class CampusEventController {

    private final RsvpService rsvpService;

    public CampusEventController(RsvpService rsvpService) {
        this.rsvpService = rsvpService;
    }

    /**
     * Endpoint: GET /api/events
     * Browse upcoming workshops with speaker credentials, department tags, and live seat badges.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
        List<EventResponse> events = rsvpService.getAllEvents();
        return ResponseEntity.ok(ApiResponse.ok("Workshops retrieved successfully", events));
    }

    /**
     * Endpoint: GET /api/events/{id}
     * Retrieve single workshop details and seat status.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEventById(@PathVariable Integer id) {
        EventResponse event = rsvpService.getEventById(id);
        return ResponseEntity.ok(ApiResponse.ok("Workshop found", event));
    }
}
