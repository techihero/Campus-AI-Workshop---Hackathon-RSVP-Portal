/**
 * Campus AI Workshop & Hackathon RSVP Portal
 * API Client Layer (Fetch API Wrapper)
 * Supports Spring Boot 3 Backend (:8080) and Local Dev Runner (:5500)
 */

const ApiConfig = {
  // Determine backend base URL:
  // If hosted on 5500 and Spring Boot is on 8080, prefer 8080; otherwise use origin.
  getBaseUrl() {
    if (window.location.port === '5500' || window.location.port === '5501') {
      // Check if user has explicitly overridden, otherwise default to Spring Boot 8080
      return window.__BACKEND_URL__ || 'http://localhost:8080';
    }
    return '';
  },

  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

const ApiService = {
  /**
   * GET /api/events
   * Fetches all upcoming AI workshops and hackathon sessions with live seat stats.
   */
  async getEvents() {
    const baseUrl = ApiConfig.getBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/api/events`, {
        method: 'GET',
        headers: ApiConfig.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch workshops (HTTP ${response.status})`);
      }

      const json = await response.json();
      return json.data || json;
    } catch (err) {
      // If Spring Boot is not yet started, attempt local same-origin fallback
      if (baseUrl !== '') {
        console.warn(`Direct connection to ${baseUrl} failed, retrying on same-origin...`);
        const fallback = await fetch(`/api/events`, { headers: ApiConfig.headers });
        if (fallback.ok) {
          const json = await fallback.json();
          return json.data || json;
        }
      }
      throw err;
    }
  },

  /**
   * GET /api/registrations
   * Fetches live attendee headcount roster (optionally filtered by ?eventId=X).
   */
  async getRegistrations(eventId = null) {
    const baseUrl = ApiConfig.getBaseUrl();
    const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
    
    try {
      const response = await fetch(`${baseUrl}/api/registrations${query}`, {
        method: 'GET',
        headers: ApiConfig.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch roster (HTTP ${response.status})`);
      }

      const json = await response.json();
      return json.data || json;
    } catch (err) {
      if (baseUrl !== '') {
        const fallback = await fetch(`/api/registrations${query}`, { headers: ApiConfig.headers });
        if (fallback.ok) {
          const json = await fallback.json();
          return json.data || json;
        }
      }
      throw err;
    }
  },

  /**
   * POST /api/registrations
   * Submits a reservation for 1-2 seats.
   * Handles HTTP 201 (Created), HTTP 400 (Bad Request/Capacity), and HTTP 409 (Duplicate Email).
   */
  async createRegistration(payload) {
    const baseUrl = ApiConfig.getBaseUrl();
    let response;

    try {
      response = await fetch(`${baseUrl}/api/registrations`, {
        method: 'POST',
        headers: ApiConfig.headers,
        body: JSON.stringify(payload)
      });
    } catch (networkErr) {
      // Fallback check
      if (baseUrl !== '') {
        response = await fetch(`/api/registrations`, {
          method: 'POST',
          headers: ApiConfig.headers,
          body: JSON.stringify(payload)
        });
      } else {
        throw new Error(`Network error connecting to RSVP API: ${networkErr.message}`);
      }
    }

    const data = await response.json().catch(() => ({}));

    if (response.status === 201) {
      return { success: true, data: data.data || data };
    }

    // Duplicate email detection: HTTP 409 Conflict
    if (response.status === 409) {
      const message = data.message || 'Duplicate registration: This email address is already registered for this workshop.';
      return { success: false, status: 409, message };
    }

    // Capacity full or validation error: HTTP 400 Bad Request
    if (response.status === 400) {
      const message = data.message || 'Validation error or seat capacity exceeded.';
      return { success: false, status: 400, message };
    }

    throw new Error(data.message || `Reservation failed (HTTP ${response.status})`);
  },

  /**
   * DELETE /api/registrations/{id}
   * Cancels an existing RSVP and restores workshop seats.
   * Expects HTTP 204 No Content.
   */
  async cancelRegistration(id) {
    const baseUrl = ApiConfig.getBaseUrl();
    let response;

    try {
      response = await fetch(`${baseUrl}/api/registrations/${id}`, {
        method: 'DELETE',
        headers: ApiConfig.headers
      });
    } catch (networkErr) {
      if (baseUrl !== '') {
        response = await fetch(`/api/registrations/${id}`, {
          method: 'DELETE',
          headers: ApiConfig.headers
        });
      } else {
        throw new Error(`Network error cancelling RSVP: ${networkErr.message}`);
      }
    }

    if (response.status === 204 || response.ok) {
      return { success: true };
    }

    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Failed to cancel registration (HTTP ${response.status})`);
  }
};

window.ApiService = ApiService;
