# Campus AI Workshop & Hackathon RSVP Portal - Walkthrough & Verification

## Executive Summary
The **Campus AI Workshop & Hackathon RSVP Portal** has been created in:
`c:\Users\ADMIN\Desktop\New folder\workshop_project`

It eliminates manual overbooking and seat shortages for college technical symposiums through real-time seat headroom management, strict 1–2 ticket quota constraints, atomic duplicate email detection per workshop, and a transparent live attendee headcount roster.

---

## 4-Phase Delivery Overview

### Phase 1: User Stories & Acceptance Criteria
- **Document**: [phase1_user_stories.md](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/docs/phase1_user_stories.md)
- **Personas**:
  - **Student Attendee (Alex)**: Workshop discovery, 1–2 seat reservations, duplicate prevention feedback, and self-cancellation.
  - **Symposium Coordinator (Prof. Vance)**: Real-time headcount table, room capacity compliance, and attendee roster management.
- **Acceptance Criteria**: Formatted in standard Gherkin syntax covering valid bookings, overbooking attempts, and duplicate emails.

---

### Phase 2: 3-Tier Architecture & Relational Schema
- **Native Draw.io Diagram**: [phase2_architecture.drawio](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/docs/phase2_architecture.drawio)
- **Architecture Documentation**: [phase2_architecture.md](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/docs/phase2_architecture.md)
- **Port Mapping**:
  - **Tier 1 (Port 5500)**: Semantic HTML5, CSS Grid, Glassmorphic dark aesthetic, reactive Vanilla JS client.
  - **Tier 2 (Port 8080)**: Java 17, Spring Boot 3 REST API (`/api/events`, `/api/registrations`), Spring Data JPA, transactional validation.
  - **Tier 3 (Port 3306)**: MySQL 8.0 Community Server (InnoDB engine, normalized schema).
- **Database DDL Scripts**:
  - [schema.sql](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/backend/src/main/resources/schema.sql)
  - [data.sql](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/backend/src/main/resources/data.sql)
- **Key Invariants**:
  - Duplicate detection: `UNIQUE KEY uk_event_email (event_id, attendee_email)`.
  - Seat quotas: `CHECK (tickets IN (1, 2))`.
  - Overcapacity prevention: `CHECK (registered_seats <= total_seats)`.

---

### Phase 3: Full-Stack Implementation

#### 1. Spring Boot 3 Backend (`backend/`)
- [pom.xml](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/backend/pom.xml): Spring Boot 3.2.5, Spring Web, Spring Data JPA, Jakarta Validation, MySQL Connector.
- [application.properties](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/backend/src/main/resources/application.properties): MySQL 8.0 on Port 3306 + H2 fallback profile.
- **Entities**:
  - [CampusEvent.java](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/backend/src/main/java/com/campus/rsvp/model/CampusEvent.java)
  - [Registration.java](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/backend/src/main/java/com/campus/rsvp/model/Registration.java)
- **Service & Repositories**:
  - [RsvpService.java](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/backend/src/main/java/com/campus/rsvp/service/RsvpService.java): `@Transactional` atomic duplicate detection and seat arithmetic.
  - [CampusEventRepository.java](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/backend/src/main/java/com/campus/rsvp/repository/CampusEventRepository.java)
  - [RegistrationRepository.java](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/backend/src/main/java/com/campus/rsvp/repository/RegistrationRepository.java)
- **Controllers & Global Exception Handling**:
  - [RegistrationController.java](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/backend/src/main/java/com/campus/rsvp/controller/RegistrationController.java): `POST /api/registrations`, `GET /api/registrations`, `DELETE /api/registrations/{id}`.
  - [CampusEventController.java](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/backend/src/main/java/com/campus/rsvp/controller/CampusEventController.java): `GET /api/events`.
  - [GlobalExceptionHandler.java](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/backend/src/main/java/com/campus/rsvp/exception/GlobalExceptionHandler.java): Standardized HTTP 400, 404, 409, 500 JSON error responses.

#### 2. Frontend SPA (`frontend/`)
- [index.html](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/frontend/index.html): Semantic layout with `<header>`, `<main>`, `<section>`, `<article>`, `<dialog>`, `<table>`, and `<output>`.
- [styles.css](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/frontend/css/styles.css): Custom dark tech symposium theme, CSS Grid cards, glassmorphic panels (`backdrop-filter: blur(16px)`), neon badge pills, capacity progress meters, and responsive tables.
- [api.js](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/frontend/js/api.js): Fetch API client handling HTTP status codes (201, 400, 409, 204).
- [app.js](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/frontend/js/app.js): Reactive state management, live seat headroom calculation, duplicate email detection feedback, ticket modal dialog, and live headcount roster table.

#### 3. Standalone Dev Server (`local-dev/`)
- [mock_server.py](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/local-dev/mock_server.py): Zero-dependency Python server that hosts the frontend on Port 5500 while implementing the exact REST API endpoints and business logic.

---

## Verification Results

### Automated API Endpoint Verification (Port 5500)
All REST API endpoints were verified via automated execution:

| Test Case | Method & Endpoint | Payload / Condition | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Browse Workshops** | `GET /api/events` | None | Returns 4 workshops with live seat headroom | `200 OK` (4 events, 22 seats available on Bootcamp) | **PASS** |
| **2. Initial Roster** | `GET /api/registrations` | None | Returns verified attendees list | `200 OK` (6 seed registrations) | **PASS** |
| **3. Reserve 2 Seats** | `POST /api/registrations` | `Alex Rivera`, 2 seats, Event 1 | Reserves 2 seats, returns confirmation ticket | `201 Created` (ID: 107, 20 seats remaining) | **PASS** |
| **4. Duplicate Detection** | `POST /api/registrations` | Same email on Event 1 | Rejects submission, prevents double-booking | `409 Conflict` (`DUPLICATE_REGISTRATION: already registered`) | **PASS** |
| **5. Capacity Overbooking** | `POST /api/registrations` | Event 4 (0 seats left) | Rejects request, enforces venue safety | `400 Bad Request` (`CAPACITY_EXCEEDED: 0 seat(s) available`) | **PASS** |
| **6. Cancel & Restore Seats**| `DELETE /api/registrations/107` | ID: 107 | Removes registration, restores 2 seats to pool | `204 No Content` | **PASS** |

---

### Phase 4: Pitch Script & DevTools Guide
- **DevTools Guide**: [phase4_devtools_verification.md](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/docs/phase4_devtools_verification.md)
- **3-Minute Stage Pitch Script**: [phase4_pitch_script.md](file:///c:/Users/ADMIN/Desktop/New folder/workshop_project/docs/phase4_pitch_script.md)

---

## How to Access & Run

### 1. View in Browser Immediately (Currently Running)
The local development server is active on:
```
http://localhost:5500
```
Simply open your browser and navigate to `http://localhost:5500` to interact with the workshops, reserve seats, test duplicate email alerts, and view the live attendee headcount roster!

### 2. Spring Boot 3 + MySQL 8.0 Production Deployment
```powershell
# In c:\Users\ADMIN\Desktop\New folder\workshop_project
mysql -u root -p < backend/src/main/resources/schema.sql
mysql -u root -p < backend/src/main/resources/data.sql

cd backend
mvn spring-boot:run
```
