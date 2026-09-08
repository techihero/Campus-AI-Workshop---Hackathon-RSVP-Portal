# Campus AI Workshop & Hackathon RSVP Portal - Implementation Plan

## Problem Statement & Context
College technical symposiums and AI workshops frequently suffer from manual overbooking via paper signups or unstructured Google Forms. This causes severe venue overcrowding, seat shortages, fire-code violations, duplicate registrations, and a lack of real-time attendee headcount visibility for event coordinators.

This project delivers an end-to-end, production-grade RSVP and capacity management solution spanning 4 structured phases:
- **Phase 1: User Stories**: Exhaustive Attendee and Coordinator persona user stories with acceptance criteria.
- **Phase 2: 3-Tier Architecture & Schema**: Draw.io / Mermaid architectural specification (`Port 5500 Frontend` -> `Port 8080 Spring Boot` -> `Port 3306 MySQL`) and MySQL 8.0 DDL relational schema with uniqueness & capacity constraints.
- **Phase 3: Full-Stack Implementation**:
  - **Frontend**: Semantic HTML5, CSS Grid, custom glassmorphic dark symposium aesthetic, live seat badges, interactive ticket selector (1-2 seats), dynamic duplicate email detection, and live headcount roster table.
  - **Backend**: Spring Boot 3 (Java 17), Spring Data JPA, Hibernate, REST controllers (`POST /api/registrations`, `GET /api/registrations`, `DELETE /api/registrations/{id}`, `GET /api/events`), transactional capacity validation, and structured error handling.
  - **Local Development Runner**: Standalone simulation server + Live Server support so the full UI and API experience can be previewed immediately.
- **Phase 4: Verification & Pitch**: Chrome DevTools validation guide (Network, a11y, DOM) and a 3-minute pitch script for symposium organizers and tech judges.

---

## User Review Required

> [!IMPORTANT]
> **Environment & Database Configuration**:
> - The production backend is configured for **Java 17 + Spring Boot 3 + MySQL 8.0** (`port 3306`).
> - In `application.properties`, we configure standard MySQL settings (`jdbc:mysql://localhost:3306/campus_rsvp_db`) alongside an auto-fallback profile (`H2 In-Memory`) so that the application can also be compiled and tested immediately without requiring a pre-running local MySQL server instance.
> - A lightweight local mock server will also be provided in the project root to enable zero-dependency instant browser preview on `http://localhost:5500`.

---

## Proposed Changes & Project Structure

The project is located in `c:\Users\ADMIN\Desktop\New folder\workshop_project`.

```
campus-ai-rsvp-portal/
├── backend/
│   ├── pom.xml                                  # Maven dependencies: Spring Web, Spring Data JPA, MySQL, Validation
│   └── src/
│       ├── main/
│       │   ├── java/com/campus/rsvp/
│       │   │   ├── CampusRsvpApplication.java    # Spring Boot entrypoint
│       │   │   ├── model/
│       │   │   │   ├── CampusEvent.java          # Entity for campus_events table
│       │   │   │   └── Registration.java         # Entity for registrations table
│       │   │   ├── dto/
│       │   │   │   ├── RegistrationRequest.java  # Validated payload (Name, Email, Dept, Tickets 1-2)
│       │   │   │   ├── RegistrationResponse.java # DTO with seat tally and timestamp
│       │   │   │   ├── EventSummaryDTO.java      # DTO with remaining seats and speaker info
│       │   │   │   └── ApiResponse.java          # Standardized JSON response envelope
│       │   │   ├── repository/
│       │   │   │   ├── CampusEventRepository.java# JPA queries for capacity and events
│       │   │   │   └── RegistrationRepository.java# Duplicate email check & active registrations
│       │   │   ├── service/
│       │   │   │   └── RsvpService.java          # Business logic: duplicate checks & seat reservations
│       │   │   ├── exception/
│       │   │   │   ├── GlobalExceptionHandler.java# @ControllerAdvice for 400, 404, 409, 500
│       │   │   │   ├── DuplicateRegistrationException.java
│       │   │   │   ├── SeatExceededException.java
│       │   │   │   └── ResourceNotFoundException.java
│       │   │   └── controller/
│       │   │       ├── CampusEventController.java# GET /api/events
│       │   │       └── RegistrationController.java# POST, GET, DELETE /api/registrations
│       │   └── resources/
│       │       ├── application.properties        # MySQL + fallback configs
│       │       ├── schema.sql                    # DDL script for MySQL 8.0
│       │       └── data.sql                      # Seed events (GenAI Workshop, Hackathon, LLM Bootcamp)
├── frontend/
│   ├── index.html                               # Semantic HTML5 (header, section, grid, form, dialog, roster)
│   ├── css/
│   │   └── styles.css                           # Modern CSS Grid, Glassmorphism, badges, animations
│   └── js/
│       ├── api.js                               # Fetch API wrapper with error handling & base URL switch
│       └── app.js                               # State management, DOM updates, live table, modals
├── docs/
│   ├── phase1_user_stories.md                   # Attendee & Coordinator user stories with Gherkin scenarios
│   ├── phase2_architecture.drawio               # Native Draw.io XML for 3-tier architecture (5500 -> 8080 -> 3306)
│   ├── phase2_architecture.md                   # Visual architecture breakdown + ER diagram
│   ├── phase4_devtools_verification.md          # Step-by-step Chrome DevTools audit protocols
│   └── phase4_pitch_script.md                   # 3-Minute stage pitch script with slide/demo timings
├── local-dev/
│   └── mock_server.py                           # Zero-dependency Python server to preview on port 5500
└── README.md                                    # Comprehensive setup & execution manual
```

---

## Detailed Phase Breakdown

### Phase 1: Attendee & Coordinator User Stories
- **Attendee Stories**:
  - Browse available workshops with real-time seat availability, venue details, speaker bio, and capacity tags.
  - Reserve 1 or 2 seats using Name, college Email, and Department.
  - Receive instant rejection with clear messaging if an email is already registered for that specific workshop.
  - Cancel a reservation using their registration ID or confirmation token to free up seats for peers.
- **Coordinator Stories**:
  - Live Headcount Roster: View registered attendees with search, department filtering, and real-time seat counter.
  - Enforce hard capacity caps preventing fire-code violations and room overbooking.
  - Download / export attendee list for badge printing and check-in desk verification.

### Phase 2: Draw.io 3-Tier Architecture & Schema Design
- **Architecture Diagram**:
  - **Tier 1 (Presentation - Port 5500)**: Semantic HTML5, CSS Grid, Vanilla JS responsive SPA served via Live Server / Nginx / Node.
  - **Tier 2 (Application / Business Logic - Port 8080)**: Spring Boot 3 REST API with Spring Data JPA, Hibernate, and Jakarta Validation.
  - **Tier 3 (Database - Port 3306)**: MySQL 8.0 Community Server storing normalized tables with ACID transactions and unique indexes.
- **Database Schema (`campus_events` & `registrations`)**:
  - `campus_events`: `id` (PK, INT AUTO_INCREMENT), `title`, `speaker_name`, `speaker_title`, `department`, `venue`, `event_date`, `total_seats`, `registered_seats`.
  - `registrations`: `id` (PK, BIGINT AUTO_INCREMENT), `event_id` (FK), `attendee_name`, `attendee_email`, `department`, `tickets` (CHECK tickets IN (1, 2)), `created_at`.
  - **Uniqueness Constraint**: `UNIQUE KEY uk_event_email (event_id, attendee_email)`.
  - **Transactional Invariant**: `registered_seats + tickets <= total_seats`.

### Phase 3: Implementation
- **Spring Boot Backend**:
  - `POST /api/registrations`: Validates `@Valid RegistrationRequest`. Checks duplicate email in repository; verifies seat headroom; updates `registered_seats` atomically using optimistic/pessimistic lock; returns `201 Created` with `RegistrationResponse`.
  - `GET /api/registrations`: Fetches all registrations (or filtered by `?eventId=X`), returning the live attendee roster.
  - `DELETE /api/registrations/{id}`: Finds registration, decrements `registered_seats` on the associated `campus_events` row, deletes record, and returns `204 No Content`.
  - `GET /api/events`: Returns all upcoming workshops with calculated `seats_left`, `status` (`AVAILABLE`, `FILLING_FAST`, `SOLD_OUT`).
  - `@RestControllerAdvice`: Returns clear error responses with timestamp, HTTP status, and user-friendly error messages (e.g. `409 Conflict` for duplicate email, `400 Bad Request` for capacity exceeded).
- **Frontend SPA**:
  - Clean, futuristic technical symposium theme (dark indigo/violet theme, glassmorphism card components, neon accents).
  - Responsive CSS Grid workshop catalog with live speaker avatar, seat count indicator, and status badge.
  - Modal / embedded RSVP form with department selector, 1-2 ticket count toggle, live validation, and error alert banners.
  - Real-time attendee roster table with search filter by name/email/department and quick-cancel action button.

### Phase 4: Local DevTools Verification & 3-Minute Pitch
- **DevTools Verification Plan**:
  - Network tab inspection: verify HTTP 201 on success, HTTP 409 on duplicate email, HTTP 400 on seat overflow, HTTP 204 on cancellation.
  - Console verification: clean execution without uncaught promises or CORS issues.
  - Accessibility & responsiveness check across mobile, tablet, and desktop viewports.
- **3-Minute Pitch Script**:
  - 0:00 - 0:45: The Problem (Chaos at symposium registration desks, paper overbooking).
  - 0:45 - 1:30: The Solution & Architecture (3-Tier real-time sync, zero duplicate booking).
  - 1:30 - 2:30: Live Demo (Selecting workshop, 1-2 tickets, duplicate prevention alert, live roster update).
  - 2:30 - 3:00: Impact & Scalability (Scales to multi-hall symposiums, ready for badge check-in).

---

## Verification Plan

### Automated / Code Quality Tests
- Run Spring Boot entity & service unit tests / verification scripts.
- Schema validation against MySQL 8.0 DDL standards.

### Browser & DevTools Verification
1. Serve the frontend at `http://localhost:5500` (or backend static resources).
2. Test browsing workshops and verifying speaker tags and seat availability calculation.
3. Test reserving 1 seat: check Network tab for `POST /api/registrations` returning `201 Created` and live seat decrement.
4. Test duplicate email detection: register the same email for the same workshop; verify `409 Conflict` response with toast alert.
5. Test capacity cap: simulate full workshop to verify disabled button and `400 Bad Request` on overflow.
6. Test cancellation: click "Cancel RSVP" on the roster table; verify `DELETE /api/registrations/{id}` returning `204 No Content` and seat count incrementing.
