# Phase 4: 3-Minute Elevator Pitch Script
## Campus AI Workshop & Hackathon RSVP Portal

**Audience**: Technical Symposium Organizing Committee, Department Chairs, Hackathon Judges  
**Speaker**: Lead Architect & Full-Stack Developer  
**Duration**: Exactly 3 Minutes (180 Seconds)  
**Deliverable**: Stage presentation & live demonstration script with timestamp cues and screen actions.

---

### [0:00 – 0:45] The Hook & The Campus Problem
> *(Visual: Slide showing an overcrowded lecture hall with students sitting on steps or turned away at the door.)*

"Good morning, judges and symposium organizers. 

Every semester, our campus hosts premier technical workshops—from Generative AI bootcamps to our 36-hour hackathons. Yet, our RSVP system still runs on unstructured Google Forms or manual paper spreadsheets.

The result? Overbooking chaos. Students submit multiple entries with secondary emails to horde seats for friends. Workshops with 50 auditorium seats end up with 110 'registered' attendees. On event day, coordinators are blindsided by fire-code capacity violations, heated arguments at check-in, and zero visibility into true headcount.

We built the **Campus AI Workshop & Hackathon RSVP Portal** to solve this permanently."

---

### [0:45 – 1:30] The Solution & 3-Tier Architecture
> *(Visual: Architecture diagram displaying Port 5500 UI &rarr; Port 8080 Spring Boot &rarr; Port 3306 MySQL.)*

"Our solution is an enterprise-grade, 3-tier capacity management system:

1. **At the Presentation Tier (Port 5500)**: We have a responsive, glassmorphic single-page application built on Semantic HTML5, modern CSS Grid, and reactive Vanilla JS. Students see real-time seat availability badges—'Available', 'Filling Fast', or 'Sold Out'—before even attempting to register.
2. **At the Application Tier (Port 8080)**: A Spring Boot 3 Java 17 REST API enforces transactional integrity. We built atomic validation to guarantee two critical invariants:
   - First: **Duplicate email prevention per workshop**. A student cannot claim multiple seats across the same session.
   - Second: **Ticket constraints**. Students are restricted to exactly 1 or 2 seats—ideal for hackathon pairs, but preventing hoarding.
3. **At the Database Tier (Port 3306)**: MySQL 8.0 with InnoDB enforces relational foreign keys and composite unique constraints: `UNIQUE(event_id, attendee_email)`. Even under sudden traffic spikes when registration opens, the database rejects race conditions."

---

### [1:30 – 2:30] The Live Demo
> *(Visual: Live browser window on Port 5500 displaying the active portal.)*

"Let's see it in action:

1. **Browsing**: Notice our upcoming *Generative AI Bootcamp*. The live seat meter shows 22 seats remaining with an amber 'Filling Fast' badge.
2. **Reservation**: Let's reserve 2 seats for student Alex Rivera. Notice the dynamic radio selector allows 1 or 2 tickets. We click *Confirm Reservation*. In under 80 milliseconds, Spring Boot processes the request, returns `HTTP 201 Created`, and an official digital confirmation ticket appears. 
3. **Instant Sync**: Watch the live dashboard—the available seats instantly decremented to 20, and Alex is immediately added to the top of our **Live Attendee Headcount Roster**.
4. **Duplicate Prevention**: Now, watch what happens if Alex tries to register again for the exact same workshop. The system catches it immediately, returning `HTTP 409 Conflict` and displaying an explicit duplicate warning banner. Not a single extra seat is lost.
5. **Cancellation**: Finally, if an attendee can no longer attend, coordinators or students can click *Cancel RSVP*. The API issues `HTTP 204 No Content`, removes the entry, and immediately restores those 2 seats to the public pool for waitlisted students."

---

### [2:30 – 3:00] Scalability, Safety & Wrap-up
> *(Visual: Summary slide highlighting metrics: 100% seat accountability, zero duplicate entries, multi-department ready.)*

"By transforming manual overbooking into automated, atomic seat allocation:
- We guarantee **100% auditorium fire safety compliance**.
- We eliminate duplicate student entries entirely.
- And symposium coordinators get a single source of truth for check-in badging and catering headcounts.

The architecture is container-ready, cloud-deployable, and easily extensible with QR-code check-ins for upcoming symposiums.

Thank you, and we welcome your questions!"

---

### Quick Reference Q&A for Presenters

**Q1: How does the system handle 100 students clicking 'RSVP' at the exact same millisecond?**  
*Answer*: "Our Spring Boot service uses `@Transactional` isolation combined with MySQL InnoDB row-level locks and a database check constraint (`registered_seats <= total_seats`). The first students claim the remaining seats, and the 101st request is cleanly rejected with an HTTP 400 'Capacity Exceeded' response without corrupting data."

**Q2: Can a student register for multiple different workshops?**  
*Answer*: "Yes! The unique constraint is composite: `UNIQUE(event_id, attendee_email)`. A student can attend the morning AI bootcamp and the evening Hackathon, but can never double-book the *same* session."
