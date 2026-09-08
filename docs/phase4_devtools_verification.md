# Phase 4: Local DevTools Verification Guide
## Campus AI Workshop & Hackathon RSVP Portal

This protocol outlines the exact testing procedures using **Chrome / Edge Developer Tools** (`F12` or `Ctrl + Shift + I`) to verify network payload integrity, HTTP response status codes, responsive layouts, accessibility, and client-side performance.

---

## 1. Prerequisites: Running the Application

### Option A: Local Dev Server on Port 5500 (Zero-Dependency)
Open a terminal in the project directory:
```powershell
python local-dev/mock_server.py
```
Open your browser to: **`http://localhost:5500`**

### Option B: Spring Boot 3 Backend on Port 8080 + Live Server on Port 5500
1. Start MySQL 8.0 on `localhost:3306` (or use the built-in H2 profile).
2. In `backend/`:
   ```powershell
   mvn spring-boot:run
   ```
3. Serve `frontend/` using VS Code Live Server or python http.server on port 5500.

---

## 2. DevTools Test Scenarios

### Test Case 1: Workshop Catalog & Live Seat Badges
- **Target**: `GET /api/events`
- **DevTools Panel**: **Network Tab** &rarr; Filter: `Fetch/XHR`
- **Steps**:
  1. Reload `http://localhost:5500`.
  2. Inspect the network request `GET /api/events`.
- **Expected Results**:
  - Status Code: **`200 OK`**
  - Response Headers: `Content-Type: application/json`
  - Response Payload:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "title": "Generative AI & Agentic Systems Bootcamp",
          "totalSeats": 100,
          "registeredSeats": 78,
          "availableSeats": 22,
          "status": "AVAILABLE"
        }
      ]
    }
    ```
  - **DOM Inspection**: Verify the progress bar has width `78%`, and badge displays `22 seats left`.

---

### Test Case 2: Successful Reservation (1-2 Seats)
- **Target**: `POST /api/registrations`
- **DevTools Panel**: **Network Tab**
- **Steps**:
  1. Click **"Reserve Seat (1-2)"** on *"Generative AI Bootcamp"*.
  2. In the modal dialog:
     - Name: `Jordan Lee`
     - Email: `jordan.lee@campus.edu`
     - Department: `Computer Science & Engineering`
     - Tickets: Select **"2 Seats"**
  3. Click **"Confirm Reservation"**.
- **Expected Results**:
  - Request Method: **`POST`**
  - Request Payload:
    ```json
    {
      "eventId": 1,
      "attendeeName": "Jordan Lee",
      "attendeeEmail": "jordan.lee@campus.edu",
      "department": "Computer Science & Eng",
      "tickets": 2
    }
    ```
  - Status Code: **`201 Created`**
  - UI State:
    - Confirmation Modal opens showing Ticket `#REG-107` for 2 seats.
    - Available seats for the Bootcamp immediately drop from `22` to `20`.
    - `Jordan Lee` appears at the top of the **Live Attendee Headcount Roster** table.

---

### Test Case 3: Duplicate Email Detection per Workshop
- **Target**: `POST /api/registrations`
- **DevTools Panel**: **Network Tab** + **Console**
- **Steps**:
  1. Click **"Reserve Seat (1-2)"** again on the same workshop (*"Generative AI Bootcamp"*).
  2. Enter the exact same email: `jordan.lee@campus.edu`.
  3. Click **"Confirm Reservation"**.
- **Expected Results**:
  - Status Code: **`409 Conflict`**
  - Response Payload:
    ```json
    {
      "success": false,
      "message": "DUPLICATE_REGISTRATION: The email 'jordan.lee@campus.edu' is already registered for 'Generative AI & Agentic Systems Bootcamp'."
    }
    ```
  - UI State:
    - Red alert banner shakes and displays duplicate error inside modal.
    - Crimson toast notification appears at bottom-right.
    - Available seat counter remains untouched (no overbooking).

---

### Test Case 4: Capacity Exceeded / Sold Out Lock
- **Target**: `POST /api/registrations`
- **DevTools Panel**: **Elements Tab** + **Network Tab**
- **Steps**:
  1. Inspect the card for *"Computer Vision & Real-time Robotics"* (`total_seats: 45`, `registered_seats: 45`).
  2. Verify the status badge displays **`SOLD OUT`** and the RSVP button has the `disabled` attribute.
  3. Attempt to force-submit a POST payload via Console for event ID `4`.
- **Expected Results**:
  - Status Code: **`400 Bad Request`**
  - Response message: `"CAPACITY_EXCEEDED: Only 0 seat(s) available..."`

---

### Test Case 5: RSVP Cancellation & Headroom Restoration
- **Target**: `DELETE /api/registrations/{id}`
- **DevTools Panel**: **Network Tab**
- **Steps**:
  1. Scroll to the **Live Headcount Roster** table.
  2. Locate `Jordan Lee` (`tickets: 2`).
  3. Click **"Cancel RSVP"** and confirm browser prompt.
- **Expected Results**:
  - Request Method: **`DELETE /api/registrations/107`**
  - Status Code: **`204 No Content`**
  - UI State:
    - Row is removed from the roster table.
    - Available seats for *"Generative AI Bootcamp"* increment by 2 (returning to `22`).
    - Blue info toast appears: *"Reservation Cancelled - Seats returned to the public pool."*

---

## 3. Lighthouse & Accessibility (a11y) Verification

1. Open DevTools &rarr; **Lighthouse** Tab.
2. Select **Desktop** or **Mobile** &rarr; Categories: **Performance**, **Accessibility**, **Best Practices**, **SEO**.
3. Click **Analyze page load**.
- **Target Scores**:
  - Accessibility: **&ge; 95** (High-contrast text, semantic elements `<header>`, `<main>`, `<dialog>`, ARIA labels on search & table).
  - Best Practices: **&ge; 95** (Clean HTTPS/HTTP standards, no deprecated APIs).
  - SEO: **100** (Descriptive title, meta description, structured heading hierarchy).
