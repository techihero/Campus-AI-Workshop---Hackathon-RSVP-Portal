# Phase 1: User Stories & Acceptance Criteria
## Campus AI Workshop & Hackathon RSVP Portal

### Problem Overview
College technical symposiums and AI hackathons experience widespread overbooking when relying on unverified Google Forms or paper signups. This leads to auditorium overcrowding, duplicate entries by students trying to guarantee a spot, lack of verified headcounts, and disappointed attendees turned away at the door.

---

### Persona 1: Student Attendee (Alex - 3rd Year CS Student)
**Role**: College student interested in attending hands-on Generative AI workshops and participating in the annual Hackathon.

#### User Story A1: Browse Upcoming Technical Workshops
> **As an** attendee,  
> **I want to** view a list of upcoming AI workshops and hackathon sessions with speaker credentials, department tags, and live seat availability badges,  
> **So that** I can identify relevant technical sessions that still have seating capacity before deciding to register.

**Acceptance Criteria (Gherkin format):**
```gherkin
Scenario: Viewing available workshops
  Given the attendee opens the Campus AI RSVP Portal homepage
  When the workshops catalog loads
  Then each workshop card displays:
    | Field                | Example                                     |
    | Title                | Generative AI & Agentic Systems Bootcamp    |
    | Speaker Name & Role  | Dr. Elena Rostova (Principal AI Researcher) |
    | Department Tag       | Dept of Computer Science & Engineering       |
    | Date & Venue         | Oct 15, 2026 • Turing Hall Auditorium 101   |
    | Total Seats          | 120                                         |
    | Available Seats      | 42 seats left                               |
    | Status Badge         | "Filling Fast" (< 50% seats left)           |
```

#### User Story A2: Reserve Seat with Ticket Constraints (1-2 Seats)
> **As an** attendee,  
> **I want to** reserve either 1 seat (for myself) or 2 seats (for myself and a project team partner) by entering my Name, College Email, and Department,  
> **So that** I can secure seats for my hackathon team without abusing registration quotas.

**Acceptance Criteria:**
```gherkin
Scenario: Successful reservation of 2 seats
  Given the workshop "LLM Fine-Tuning & Quantization" has at least 2 seats available
  When the attendee enters:
    | Field      | Value                   |
    | Full Name  | Alex Rivera             |
    | Email      | alex.rivera@campus.edu  |
    | Department | CSE                     |
    | Tickets    | 2                       |
  And clicks "Confirm RSVP"
  Then the system reserves 2 seats
  And returns HTTP 201 Created with a confirmation ID
  And the available seats for the workshop decrement by 2
  And the attendee appears in the real-time Headcount Roster

Scenario: Attempting to reserve more than 2 seats
  When the attendee attempts to select 3 or more tickets
  Then the interface restricts the selector to max 2
  And the API rejects any payload where tickets < 1 or tickets > 2 with HTTP 400 Bad Request
```

#### User Story A3: Duplicate Email Detection per Workshop
> **As an** attendee,  
> **I want to** receive an immediate, explicit error message if my email address has already been used to register for this specific workshop,  
> **So that** I don't accidentally create duplicate bookings or block other students from attending.

**Acceptance Criteria:**
```gherkin
Scenario: Detecting duplicate email on the same workshop
  Given "alex.rivera@campus.edu" is already registered for "Generative AI Bootcamp"
  When the attendee submits a second reservation for "Generative AI Bootcamp" using "alex.rivera@campus.edu"
  Then the system rejects the registration
  And returns HTTP 409 Conflict
  And displays an alert banner: "Registration Error: This email is already registered for this workshop."
  And no additional seats are deducted from the workshop capacity
```

#### User Story A4: Cancel Reservation to Free Up Seats
> **As an** attendee who can no longer attend,  
> **I want to** cancel my existing RSVP using my registration ID,  
> **So that** my reserved seats are instantly returned to the public pool for waitlisted students.

**Acceptance Criteria:**
```gherkin
Scenario: Cancellation restores available seats
  Given registration #104 holds 2 seats for "Hackathon Kickoff"
  When the attendee or coordinator triggers cancellation for registration #104
  Then the system executes DELETE /api/registrations/104
  And returns HTTP 204 No Content
  And the workshop available seats increase by 2
  And registration #104 is removed from the live roster
```

---

### Persona 2: Symposium Coordinator (Prof. Vance - Technical Event Lead)
**Role**: Faculty/Student Coordinator responsible for logistics, room capacity compliance, and attendee roster management.

#### User Story C1: Real-Time Live Attendee Headcount Roster
> **As a** symposium coordinator,  
> **I want to** inspect a live attendee headcount roster displaying registered students, department breakdown, ticket count, and registration timestamps,  
> **So that** I can track room occupancy in real time and prepare badging materials.

**Acceptance Criteria:**
```gherkin
Scenario: Viewing live attendee roster
  Given multiple students have registered across workshops
  When the coordinator navigates to the "Live Headcount Roster" section
  Then a structured data table displays:
    | ID | Attendee Name | Email | Department | Workshop | Tickets | Registered At | Action |
  And dynamic counter pills display Total Registrations, Total Seats Claimed, and Capacity Utilization %
  And the table allows instant live search by attendee name, email, or workshop
```

#### User Story C2: Enforcing Hard Seat Caps (Overbooking Prevention)
> **As a** coordinator,  
> **I want** the system to automatically block reservations when a workshop reaches 100% capacity,  
> **So that** we never violate venue fire codes or experience auditorium seat shortages.

**Acceptance Criteria:**
```gherkin
Scenario: Workshop sold out
  Given a workshop has total_seats = 50 and registered_seats = 50
  When an attendee views the workshop card
  Then the status badge displays "SOLD OUT" in high-contrast crimson
  And the "RSVP" button is disabled
  And if a concurrent request arrives at the backend, it returns HTTP 400 Bad Request with message "Workshop capacity exceeded"
```
