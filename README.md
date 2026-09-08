# Campus AI Workshop & Hackathon RSVP Portal

> College technical symposiums and AI workshops face manual overbooking via paper or unstructured forms, leading to seat shortages and lack of attendee headcount. This portal provides real-time seat management, duplicate email detection, ticket quota constraints, and a live attendee headcount roster.

---

## 4-Phase Delivery Breakdown

- **Phase 1**: [Attendee & Coordinator User Stories](file:///c:/Users/ADMIN/Desktop/New%20folder/workshop_project/docs/phase1_user_stories.md) with full Gherkin acceptance criteria.
- **Phase 2**: [3-Tier Architecture Specification](file:///c:/Users/ADMIN/Desktop/New%20folder/workshop_project/docs/phase2_architecture.md) & [Draw.io Diagram](file:///c:/Users/ADMIN/Desktop/New%20folder/workshop_project/docs/phase2_architecture.drawio) (`5500 -> 8080 -> 3306`) with MySQL 8.0 DDL schema.
- **Phase 3**: Full implementation:
  - **Frontend**: Semantic HTML5, CSS Grid, Glassmorphic dark tech theme, reactive Vanilla JS.
  - **Backend**: Java 17, Spring Boot 3 REST API, Spring Data JPA, Hibernate, transactional capacity guards.
  - **Local Dev Server**: Standalone zero-dependency runner on Port 5500.
- **Phase 4**: [Chrome DevTools Verification Protocol](file:///c:/Users/ADMIN/Desktop/New%20folder/workshop_project/docs/phase4_devtools_verification.md) & [3-Minute Stage Pitch Script](file:///c:/Users/ADMIN/Desktop/New%20folder/workshop_project/docs/phase4_pitch_script.md).

---

## 3-Tier Architecture (`5500 -> 8080 -> 3306`)

```
+-------------------------------------------------------------------------+
| Tier 1: Presentation (Port 5500)                                        |
|   • Semantic HTML5 Form, Accessible <dialog> Modals & Headcount Table   |
|   • CSS Grid, Glassmorphic Dark Aesthetics & Live Seat Progress Bars     |
|   • Vanilla JS ES6 Reactive State & Fetch Client                        |
+-------------------------------------------------------------------------+
                                   |
                         HTTP REST / JSON (CORS)
                                   v
+-------------------------------------------------------------------------+
| Tier 2: Business Logic (Port 8080)                                      |
|   • Spring Boot 3 / Java 17 REST API                                    |
|   • RsvpService (@Transactional validation)                             |
|   • Duplicate Email Detection per Workshop (HTTP 409 Conflict)          |
|   • Ticket Headroom & Max 2 Seats Validation (HTTP 400 Bad Request)     |
|   • Spring Data JPA Repositories & Connection Pooling                   |
+-------------------------------------------------------------------------+
                                   |
                        JDBC / TCP (Port 3306)
                                   v
+-------------------------------------------------------------------------+
| Tier 3: Database Engine (Port 3306)                                     |
|   • MySQL 8.0 Server (InnoDB Engine)                                    |
|   • campus_events (Auditorium capacity & speaker credentials)           |
|   • registrations (Attendee records, tickets: 1 or 2)                   |
|   • Constraints: UNIQUE(event_id, attendee_email), CHECK(tickets IN 1,2)|
+-------------------------------------------------------------------------+
```

---

## Key Features

1. **Browse Workshops with Live Seat & Speaker Badges**:
   - Live availability tracking (`seats remaining` / `total seats`).
   - Dynamic status badges: `Available` (emerald), `Filling Fast` (amber &ge; 80%), `Sold Out` (crimson 100%).
   - Detailed speaker credential avatars and venue logistics.
2. **Strict Ticket Constraints (1-2 Seats)**:
   - Solo attendees or hackathon pairs only.
   - Enforced client-side and server-side via `@Min(1) @Max(2)` and database constraints.
3. **Duplicate Email Detection per Workshop**:
   - Prevents slot hoarding using `UNIQUE KEY uk_event_email (event_id, attendee_email)`.
   - Returns explicit `409 Conflict` with clear alert banners.
4. **Real-Time Live Attendee Headcount Roster**:
   - Instant search and filtering by attendee name, email, department, or workshop.
   - Actionable one-click cancellation button (`DELETE /api/registrations/{id}`) that immediately restores seats back to the workshop headroom.

---

## REST Endpoints Specification

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Browse all upcoming workshops with live seat headroom | `200 OK` |
| `GET` | `/api/events/{id}` | Retrieve specific workshop details and availability | `200 OK`, `404 Not Found` |
| `POST` | `/api/registrations` | Reserve 1 or 2 seats with duplicate email detection | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `GET` | `/api/registrations` | Retrieve live attendee headcount roster (optional `?eventId=X`) | `200 OK` |
| `DELETE` | `/api/registrations/{id}` | Cancel reservation & restore seats to workshop pool | `204 No Content`, `404 Not Found` |

### Sample `POST /api/registrations` Payload
```json
{
  "eventId": 1,
  "attendeeName": "Jordan Lee",
  "attendeeEmail": "jordan.lee@campus.edu",
  "department": "Computer Science & Eng",
  "tickets": 2
}
```

---

## Database Schema (`schema.sql`)

```sql
CREATE TABLE campus_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    speaker_name VARCHAR(100) NOT NULL,
    speaker_title VARCHAR(120) NOT NULL,
    department VARCHAR(80) NOT NULL,
    venue VARCHAR(120) NOT NULL,
    event_date DATETIME NOT NULL,
    total_seats INT NOT NULL,
    registered_seats INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    attendee_name VARCHAR(100) NOT NULL,
    attendee_email VARCHAR(150) NOT NULL,
    department VARCHAR(80) NOT NULL,
    tickets INT NOT NULL DEFAULT 1,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES campus_events(id),
    CONSTRAINT chk_tickets CHECK (tickets IN (1, 2)),
    CONSTRAINT uk_event_email UNIQUE (event_id, attendee_email)
) ENGINE=InnoDB;
```

---

## How to Run

### Mode 1: Instant Local Dev Preview (Port 5500)
To test the complete UI, forms, duplicate email detection, and roster without requiring a local MySQL setup:
```powershell
# From project root:
python local-dev/mock_server.py
```
Open **`http://localhost:5500`** in your browser.

### Mode 2: Spring Boot 3 Backend (Port 8080) + MySQL 8.0 (Port 3306)
1. Ensure MySQL 8.0 is running on port 3306 with database `campus_rsvp_db`.
2. Run database initialization:
   ```sql
   mysql -u root -p < backend/src/main/resources/schema.sql
   mysql -u root -p < backend/src/main/resources/data.sql
   ```
3. Start the Spring Boot Application:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```
4. Serve the frontend:
   Open `frontend/index.html` via VS Code Live Server (port 5500) or any static file server.
