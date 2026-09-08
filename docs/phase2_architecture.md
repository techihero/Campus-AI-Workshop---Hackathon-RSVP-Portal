# Phase 2: 3-Tier Architecture & Database Schema Design
## Campus AI Workshop & Hackathon RSVP Portal

This document outlines the **3-Tier Architecture** (`Port 5500` &rarr; `Port 8080` &rarr; `Port 3306`), communication protocols, relational database schema, data integrity invariants, and end-to-end sequence flows.

---

## 1. 3-Tier Architecture Diagram (5500 &rarr; 8080 &rarr; 3306)

```mermaid
flowchart LR
    subgraph Tier1 ["Tier 1: Presentation Layer (:5500)"]
        UI["Web Browser Client"]
        HTML["Semantic HTML5 Form & Roster"]
        CSS["CSS Grid & Glassmorphism Theme"]
        JS["Vanilla JS API & State Manager"]
        UI --- HTML
        UI --- CSS
        UI --- JS
    end

    subgraph Tier2 ["Tier 2: Business Logic Layer (:8080)"]
        REST["Spring Boot 3 REST Controllers\n/api/events\n/api/registrations"]
        SVC["RsvpService\n• Duplicate Email Guard\n• Hard Capacity Check"]
        EXC["GlobalExceptionHandler\n400 / 404 / 409 / 500"]
        JPA["Spring Data JPA\n• EventRepository\n• RegistrationRepository"]
        REST --> SVC
        SVC --> JPA
        SVC -.-> EXC
    end

    subgraph Tier3 ["Tier 3: Database Storage Layer (:3306)"]
        MYSQL[("MySQL 8.0 Community\nInnoDB Engine")]
        T_EVENTS["campus_events\n(Capacity & Speaker Info)"]
        T_REGS["registrations\n(Attendee Data & Tickets)"]
        MYSQL --- T_EVENTS
        MYSQL --- T_REGS
    end

    Tier1 -- "HTTP REST / JSON\n(CORS Enabled)\nPOST / GET / DELETE" --> Tier2
    Tier2 -- "JDBC Protocol / TCP 3306\nHikariCP Connection Pool\nACID Transactions" --> Tier3
```

### Layer Breakdown & Responsibilities

| Tier | Component | Port | Technology | Primary Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Presentation** | Frontend Client | `5500` | Semantic HTML5, CSS Grid, Vanilla JS | Form validation, real-time seat headroom display, ticket selector (1-2), live roster rendering, user feedback toasts. |
| **Tier 2: Application** | Backend REST API | `8080` | Java 17, Spring Boot 3, Spring Data JPA | Enforces duplicate email detection, validates ticket limits (1-2), performs atomic capacity increments, serves REST endpoints. |
| **Tier 3: Persistence** | Database Engine | `3306` | MySQL 8.0 Server (InnoDB) | Enforces unique email per workshop constraint (`uk_event_email`), foreign keys, transactional atomicity, persistent storage. |

---

## 2. Relational Database Schema Design (MySQL 8.0)

```mermaid
erDiagram
    campus_events ||--o{ registrations : "receives"

    campus_events {
        INT id PK "AUTO_INCREMENT"
        VARCHAR(150) title "Event title"
        VARCHAR(100) speaker_name "Speaker full name"
        VARCHAR(100) speaker_title "Title / Designation"
        VARCHAR(80) department "Host department"
        VARCHAR(100) venue "Auditorium / Lab location"
        DATETIME event_date "Date and time"
        INT total_seats "Venue seating capacity"
        INT registered_seats "Currently claimed seats"
        DATETIME created_at "Creation timestamp"
    }

    registrations {
        BIGINT id PK "AUTO_INCREMENT"
        INT event_id FK "References campus_events(id)"
        VARCHAR(100) attendee_name "Student full name"
        VARCHAR(150) attendee_email "College email address"
        VARCHAR(80) department "Student's department"
        INT tickets "Seats requested (1 or 2)"
        DATETIME registered_at "Registration timestamp"
    }
```

### Constraints & Invariants

1. **Duplicate Email Prevention**:
   ```sql
   UNIQUE KEY uk_event_email (event_id, attendee_email)
   ```
   *Guarantees a student can never register twice for the same workshop, preventing slot hoarding.*

2. **Ticket Allocation Bounds**:
   ```sql
   CONSTRAINT chk_ticket_count CHECK (tickets IN (1, 2))
   ```
   *Restricts reservations to either single (1) or pair (2) tickets.*

3. **Capacity Invariant**:
   ```sql
   CONSTRAINT chk_capacity CHECK (registered_seats <= total_seats)
   ```
   *Guarantees venue capacity is never exceeded at the database level.*

4. **Foreign Key Integrity**:
   ```sql
   FOREIGN KEY (event_id) REFERENCES campus_events(id) ON DELETE RESTRICT ON UPDATE CASCADE
   ```
   *Preserves data integrity between registrations and their target event.*

---

## 3. Sequence Flows

### Flow A: Reservation Submission (`POST /api/registrations`)

```mermaid
sequenceDiagram
    autonumber
    actor User as Attendee / Student
    participant UI as Frontend (:5500)
    participant Ctrl as RegistrationController (:8080)
    participant Svc as RsvpService (:8080)
    participant Repo as RegistrationRepository
    participant DB as MySQL 8.0 (:3306)

    User->>UI: Selects 1 or 2 tickets, enters Name, Email, Dept
    UI->>Ctrl: POST /api/registrations (JSON Payload)
    Ctrl->>Svc: reserveSeat(request)
    
    rect rgb(240, 248, 255)
        Note over Svc,DB: Atomic Verification
        Svc->>Repo: existsByCampusEventIdAndAttendeeEmail(eventId, email)
        Repo->>DB: SELECT COUNT(*) FROM registrations WHERE event_id = ? AND attendee_email = ?
        DB-->>Repo: 0 (No duplicate)
        
        Svc->>DB: SELECT total_seats, registered_seats FROM campus_events WHERE id = ?
        DB-->>Svc: total=100, registered=98 (2 seats left)
        
        alt Capacity Exceeded
            Svc-->>Ctrl: throw SeatExceededException("Capacity full")
            Ctrl-->>UI: HTTP 400 Bad Request
            UI-->>User: Show "Sold Out / Capacity Exceeded" Warning
        else Duplicate Email Found
            Svc-->>Ctrl: throw DuplicateRegistrationException("Email already registered")
            Ctrl-->>UI: HTTP 409 Conflict
            UI-->>User: Show "Already Registered" Error Toast
        else Valid Reservation
            Svc->>DB: INSERT INTO registrations (...)
            Svc->>DB: UPDATE campus_events SET registered_seats = registered_seats + tickets WHERE id = ?
            DB-->>Svc: Success
            Svc-->>Ctrl: RegistrationResponse DTO
            Ctrl-->>UI: HTTP 201 Created (JSON confirmation)
            UI->>UI: Decrement seat badge, prepend to live roster
            UI-->>User: Show Green Success Confirmation Modal
        end
    end
```

### Flow B: Cancellation & Seat Restoration (`DELETE /api/registrations/{id}`)

```mermaid
sequenceDiagram
    autonumber
    actor User as Coordinator / Attendee
    participant UI as Frontend (:5500)
    participant Ctrl as RegistrationController (:8080)
    participant Svc as RsvpService (:8080)
    participant DB as MySQL 8.0 (:3306)

    User->>UI: Clicks "Cancel RSVP" on Roster Table
    UI->>Ctrl: DELETE /api/registrations/{id}
    Ctrl->>Svc: cancelRegistration(id)
    Svc->>DB: SELECT * FROM registrations WHERE id = ?
    DB-->>Svc: Found (event_id=1, tickets=2)
    Svc->>DB: DELETE FROM registrations WHERE id = ?
    Svc->>DB: UPDATE campus_events SET registered_seats = registered_seats - 2 WHERE id = 1
    DB-->>Svc: Updated
    Svc-->>Ctrl: void
    Ctrl-->>UI: HTTP 204 No Content
    UI->>UI: Remove row from Roster & Increment Workshop Seat Badge
    UI-->>User: Show "Reservation Cancelled - 2 Seats Restored" Toast
```
