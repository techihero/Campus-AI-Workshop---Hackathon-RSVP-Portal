package com.campus.rsvp.controller;

import com.campus.rsvp.dto.ApiResponse;
import com.campus.rsvp.dto.RegistrationRequest;
import com.campus.rsvp.dto.RegistrationResponse;
import com.campus.rsvp.service.RsvpService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class RegistrationController {

    private final RsvpService rsvpService;

    public RegistrationController(RsvpService rsvpService) {
        this.rsvpService = rsvpService;
    }

    /**
     * Endpoint 1: POST /api/registrations
     * Reserves 1-2 seats for an attendee, enforces duplicate email detection and seat caps.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RegistrationResponse>> createRegistration(
            @Valid @RequestBody RegistrationRequest request) {
        RegistrationResponse response = rsvpService.reserveSeat(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successfully created", response));
    }

    /**
     * Endpoint 2: GET /api/registrations
     * Returns live attendee headcount roster (optionally filtered by ?eventId=X).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getRegistrations(
            @RequestParam(required = false) Integer eventId) {
        List<RegistrationResponse> registrations = rsvpService.getRegistrations(eventId);
        return ResponseEntity.ok(ApiResponse.ok("Registrations retrieved successfully", registrations));
    }

    /**
     * Endpoint 3: DELETE /api/registrations/{id}
     * Cancels an existing RSVP and restores seats back to the workshop pool.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelRegistration(@PathVariable Long id) {
        rsvpService.cancelRegistration(id);
        return ResponseEntity.noContent().build();
    }
}
