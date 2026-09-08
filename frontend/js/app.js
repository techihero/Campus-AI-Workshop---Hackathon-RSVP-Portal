/**
 * Campus AI Workshop & Hackathon RSVP Portal
 * Main Application Logic & Reactive State Management
 */

(function () {
  'use strict';

  // Application State
  const state = {
    events: [],
    registrations: [],
    activeFilter: 'all',
    searchQuery: '',
    selectedEvent: null
  };

  // Fallback seed data in case backend server is starting up or in standalone preview
  const fallbackEvents = [
    {
      id: 1,
      title: 'Generative AI & Agentic Systems Bootcamp',
      description: 'Hands-on masterclass on building multi-agent architectures, reasoning loops, tool calling, and autonomous developer workflows.',
      speakerName: 'Dr. Elena Rostova',
      speakerTitle: 'Principal AI Researcher, DeepMind Alum',
      department: 'Computer Science & Eng',
      venue: 'Turing Hall - Auditorium 101',
      eventDate: '2026-10-15T09:30:00',
      totalSeats: 100,
      registeredSeats: 78,
      availableSeats: 22,
      percentFilled: 78.0,
      status: 'AVAILABLE'
    },
    {
      id: 2,
      title: 'Campus 36-Hour Autonomous Hackathon',
      description: 'Build and deploy end-to-end AI applications, robotics integrations, and edge vision models with compute clusters provided.',
      speakerName: 'Marcus Thorne',
      speakerTitle: 'Senior Director of Platform Engineering',
      department: 'Interdisciplinary AI Lab',
      venue: 'Innovation Hub - Grand Atrium',
      eventDate: '2026-10-18T18:00:00',
      totalSeats: 150,
      registeredSeats: 142,
      availableSeats: 8,
      percentFilled: 94.6,
      status: 'FILLING_FAST'
    },
    {
      id: 3,
      title: 'LLM Fine-Tuning, LoRA & Quantization',
      description: 'Deep dive into parameter-efficient fine-tuning (PEFT), QLoRA, GGUF conversion, and running 70B models on commodity hardware.',
      speakerName: 'Priya Sundaram',
      speakerTitle: 'Staff ML Engineer & Open Source Core',
      department: 'Data Science & Analytics',
      venue: 'Lovelace Lab 304',
      eventDate: '2026-10-22T14:00:00',
      totalSeats: 60,
      registeredSeats: 58,
      availableSeats: 2,
      percentFilled: 96.6,
      status: 'FILLING_FAST'
    },
    {
      id: 4,
      title: 'Computer Vision & Real-time Robotics',
      description: 'Deploying YOLOv10 and Spatial AI models on Jetson Orin Nano boards for autonomous obstacle avoidance.',
      speakerName: 'Prof. David Kim',
      speakerTitle: 'Chair of Robotics & Autonomous Systems',
      department: 'Robotics & Mechatronics',
      venue: 'Robotics Bay West Wing',
      eventDate: '2026-10-25T10:00:00',
      totalSeats: 45,
      registeredSeats: 45,
      availableSeats: 0,
      percentFilled: 100.0,
      status: 'SOLD_OUT'
    }
  ];

  const fallbackRegistrations = [
    {
      id: 101,
      eventId: 1,
      eventTitle: 'Generative AI & Agentic Systems Bootcamp',
      attendeeName: 'Aarav Patel',
      attendeeEmail: 'aarav.patel@campus.edu',
      department: 'Computer Science & Eng',
      tickets: 2,
      registeredAt: '2026-10-01T10:15:00',
      remainingSeats: 22,
      confirmationMessage: 'Active'
    },
    {
      id: 102,
      eventId: 1,
      eventTitle: 'Generative AI & Agentic Systems Bootcamp',
      attendeeName: 'Sophia Chen',
      attendeeEmail: 'sophia.chen@campus.edu',
      department: 'Data Science & Analytics',
      tickets: 1,
      registeredAt: '2026-10-01T11:30:00',
      remainingSeats: 22,
      confirmationMessage: 'Active'
    },
    {
      id: 103,
      eventId: 1,
      eventTitle: 'Generative AI & Agentic Systems Bootcamp',
      attendeeName: 'Liam O\'Connor',
      attendeeEmail: 'liam.oc@campus.edu',
      department: 'Information Technology',
      tickets: 2,
      registeredAt: '2026-10-02T09:45:00',
      remainingSeats: 22,
      confirmationMessage: 'Active'
    },
    {
      id: 104,
      eventId: 2,
      eventTitle: 'Campus 36-Hour Autonomous Hackathon',
      attendeeName: 'Zara Khan',
      attendeeEmail: 'zara.k@campus.edu',
      department: 'Computer Science & Eng',
      tickets: 2,
      registeredAt: '2026-10-02T14:20:00',
      remainingSeats: 8,
      confirmationMessage: 'Active'
    },
    {
      id: 105,
      eventId: 2,
      eventTitle: 'Campus 36-Hour Autonomous Hackathon',
      attendeeName: 'Ethan Wright',
      attendeeEmail: 'ethan.w@campus.edu',
      department: 'Electronics & Comm',
      tickets: 2,
      registeredAt: '2026-10-03T16:10:00',
      remainingSeats: 8,
      confirmationMessage: 'Active'
    },
    {
      id: 106,
      eventId: 3,
      eventTitle: 'LLM Fine-Tuning, LoRA & Quantization',
      attendeeName: 'Maya Lin',
      attendeeEmail: 'maya.lin@campus.edu',
      department: 'Artificial Intelligence',
      tickets: 1,
      registeredAt: '2026-10-04T12:00:00',
      remainingSeats: 2,
      confirmationMessage: 'Active'
    }
  ];

  // DOM Elements
  const workshopGrid = document.getElementById('workshopGrid');
  const rosterTableBody = document.getElementById('rosterTableBody');
  const rosterSearchInput = document.getElementById('rosterSearchInput');
  const btnRefreshRoster = document.getElementById('btnRefreshRoster');
  const rsvpModal = document.getElementById('rsvpModal');
  const confirmationModal = document.getElementById('confirmationModal');
  const rsvpForm = document.getElementById('rsvpForm');
  const modalAlertBanner = document.getElementById('modalAlertBanner');
  const toastContainer = document.getElementById('toastContainer');
  const backendStatusText = document.getElementById('backendStatusText');

  // KPI Elements
  const kpiTotalSeatsVal = document.getElementById('kpiTotalSeatsVal');
  const kpiClaimedSeatsVal = document.getElementById('kpiClaimedSeatsVal');
  const kpiAvailableSeatsVal = document.getElementById('kpiAvailableSeatsVal');
  const kpiRegistrationsVal = document.getElementById('kpiRegistrationsVal');

  /**
   * Application Initialization
   */
  async function init() {
    setupEventListeners();
    await loadData();
  }

  /**
   * Load Events and Registrations
   */
  async function loadData() {
    try {
      const [eventsData, regsData] = await Promise.all([
        window.ApiService.getEvents(),
        window.ApiService.getRegistrations()
      ]);

      state.events = eventsData;
      state.registrations = regsData;
      if (backendStatusText) backendStatusText.textContent = 'Live Sync: Active';
    } catch (err) {
      console.warn('Backend REST API not reachable on port 8080, initializing with verified seed data:', err.message);
      state.events = fallbackEvents;
      state.registrations = fallbackRegistrations;
      if (backendStatusText) backendStatusText.textContent = 'Local Mode: 5500';
    }

    renderAll();
  }

  /**
   * Master Render Function
   */
  function renderAll() {
    renderKPIs();
    renderWorkshops();
    renderRoster();
  }

  /**
   * Render KPI Summary Cards
   */
  function renderKPIs() {
    let totalCap = 0;
    let claimed = 0;
    let available = 0;

    state.events.forEach(e => {
      totalCap += e.totalSeats;
      claimed += e.registeredSeats;
      available += Math.max(0, e.totalSeats - e.registeredSeats);
    });

    if (kpiTotalSeatsVal) kpiTotalSeatsVal.textContent = totalCap;
    if (kpiClaimedSeatsVal) kpiClaimedSeatsVal.textContent = claimed;
    if (kpiAvailableSeatsVal) kpiAvailableSeatsVal.textContent = available;
    if (kpiRegistrationsVal) kpiRegistrationsVal.textContent = state.registrations.length;
  }

  /**
   * Render Workshop Cards via CSS Grid
   */
  function renderWorkshops() {
    if (!workshopGrid) return;

    let filtered = state.events;
    if (state.activeFilter === 'bootcamp') {
      filtered = state.events.filter(e => e.title.toLowerCase().includes('bootcamp'));
    } else if (state.activeFilter === 'hackathon') {
      filtered = state.events.filter(e => e.title.toLowerCase().includes('hackathon'));
    }

    if (filtered.length === 0) {
      workshopGrid.innerHTML = `<div class="loading-placeholder">No workshops found matching criteria.</div>`;
      return;
    }

    workshopGrid.innerHTML = filtered.map(event => {
      const available = Math.max(0, event.totalSeats - event.registeredSeats);
      const percent = Math.min(100, Math.round((event.registeredSeats / event.totalSeats) * 100));
      const isSoldOut = available === 0;

      // Status Badge Logic
      let badgeClass = 'badge-available';
      let badgeLabel = 'Available';

      if (isSoldOut) {
        badgeClass = 'badge-soldout';
        badgeLabel = 'Sold Out';
      } else if (percent >= 80) {
        badgeClass = 'badge-filling';
        badgeLabel = 'Filling Fast';
      }

      // Progress bar color
      let progressClass = '';
      if (isSoldOut) progressClass = 'fill-full';
      else if (percent >= 80) progressClass = 'fill-warn';

      const initials = event.speakerName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('');

      return `
        <article class="workshop-card" data-id="${event.id}">
          <div class="card-top">
            <div class="card-meta-row">
              <span class="dept-tag">${escapeHtml(event.department)}</span>
              <span class="status-badge ${badgeClass}">${badgeLabel}</span>
            </div>

            <h3 class="card-title">${escapeHtml(event.title)}</h3>
            <p class="card-description">${escapeHtml(event.description)}</p>

            <div class="speaker-box">
              <div class="speaker-avatar" aria-hidden="true">${initials}</div>
              <div class="speaker-details">
                <span class="speaker-name">${escapeHtml(event.speakerName)}</span>
                <span class="speaker-title">${escapeHtml(event.speakerTitle)}</span>
              </div>
            </div>

            <div class="logistics-list">
              <div class="logistics-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>${escapeHtml(event.venue)}</span>
              </div>
              <div class="logistics-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>${formatDateTime(event.eventDate)}</span>
              </div>
            </div>

            <div class="seat-meter">
              <div class="seat-header">
                <span class="seat-label">Capacity Utilization (${percent}%)</span>
                <span class="seat-count">${available} / ${event.totalSeats} seats left</span>
              </div>
              <div class="progress-track" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-fill ${progressClass}" style="width: ${percent}%;"></div>
              </div>
            </div>
          </div>

          <div class="card-bottom">
            <button class="btn btn-primary btn-block btn-rsvp" 
                    data-id="${event.id}" 
                    ${isSoldOut ? 'disabled' : ''}>
              ${isSoldOut ? 'Capacity Reached' : 'Reserve Seat (1-2)'}
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  /**
   * Render Live Attendee Headcount Roster Table
   */
  function renderRoster() {
    if (!rosterTableBody) return;

    let filtered = state.registrations;
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      filtered = state.registrations.filter(r => 
        r.attendeeName.toLowerCase().includes(q) ||
        r.attendeeEmail.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.eventTitle.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      rosterTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-6 text-muted">
            ${state.searchQuery ? 'No attendees found matching search filter.' : 'No verified registrations yet.'}
          </td>
        </tr>
      `;
      return;
    }

    rosterTableBody.innerHTML = filtered.map(reg => {
      return `
        <tr data-registration-id="${reg.id}">
          <td><code>#${reg.id}</code></td>
          <td>
            <div class="attendee-cell">
              <span class="attendee-name">${escapeHtml(reg.attendeeName)}</span>
            </div>
          </td>
          <td><code>${escapeHtml(reg.attendeeEmail)}</code></td>
          <td><span class="attendee-dept">${escapeHtml(reg.department)}</span></td>
          <td><strong>${escapeHtml(reg.eventTitle)}</strong></td>
          <td><span class="ticket-pill">${reg.tickets} ${reg.tickets === 1 ? 'Seat' : 'Seats'}</span></td>
          <td>${formatDateShort(reg.registeredAt)}</td>
          <td class="text-right">
            <button class="btn btn-danger btn-sm btn-cancel-rsvp" data-id="${reg.id}" data-name="${escapeHtml(reg.attendeeName)}" title="Cancel RSVP and restore seats">
              Cancel RSVP
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Workshop filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeFilter = btn.dataset.filter;
        renderWorkshops();
      });
    });

    // Roster search input
    if (rosterSearchInput) {
      rosterSearchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderRoster();
      });
    }

    // Refresh button
    if (btnRefreshRoster) {
      btnRefreshRoster.addEventListener('click', async () => {
        btnRefreshRoster.disabled = true;
        await loadData();
        btnRefreshRoster.disabled = false;
        showToast('Roster Refreshed', 'Live headcount synchronized with database.', 'info');
      });
    }

    // Workshop Grid Click (RSVP Buttons)
    if (workshopGrid) {
      workshopGrid.addEventListener('click', (e) => {
        const rsvpBtn = e.target.closest('.btn-rsvp');
        if (rsvpBtn) {
          const eventId = parseInt(rsvpBtn.dataset.id, 10);
          openRsvpModal(eventId);
        }
      });
    }

    // Modal Close buttons
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelForm = document.getElementById('btnCancelForm');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeRsvpModal);
    if (btnCancelForm) btnCancelForm.addEventListener('click', closeRsvpModal);

    // RSVP Form Submit
    if (rsvpForm) {
      rsvpForm.addEventListener('submit', handleRsvpSubmit);
    }

    // Confirmation Modal Close
    const btnCloseConfirmation = document.getElementById('btnCloseConfirmation');
    if (btnCloseConfirmation) {
      btnCloseConfirmation.addEventListener('click', () => {
        confirmationModal.close();
      });
    }

    // Roster Table Click (Cancel RSVP)
    if (rosterTableBody) {
      rosterTableBody.addEventListener('click', handleRosterClick);
    }
  }

  /**
   * Open Accessible RSVP Dialog Modal
   */
  function openRsvpModal(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;

    state.selectedEvent = event;
    const available = Math.max(0, event.totalSeats - event.registeredSeats);

    // Populate Modal Elements
    document.getElementById('formEventId').value = event.id;
    document.getElementById('modalTitle').textContent = `RSVP: ${event.title}`;
    document.getElementById('modalVenue').textContent = `${event.venue} • ${formatDateTime(event.eventDate)}`;
    document.getElementById('modalSeatsBadge').textContent = `${available} seats left`;

    // Clear Previous Alerts & Form Fields
    hideModalAlert();
    rsvpForm.reset();
    document.getElementById('ticket1').checked = true;

    // Constrain 2-ticket option if only 1 seat remains
    const ticket2Radio = document.getElementById('ticket2');
    const ticket2Label = ticket2Radio.closest('.ticket-radio-label');
    if (available < 2) {
      ticket2Radio.disabled = true;
      ticket2Label.style.opacity = '0.4';
      ticket2Label.style.pointerEvents = 'none';
      ticket2Label.title = 'Only 1 seat available';
    } else {
      ticket2Radio.disabled = false;
      ticket2Label.style.opacity = '1';
      ticket2Label.style.pointerEvents = 'auto';
      ticket2Label.title = '';
    }

    rsvpModal.showModal();
  }

  /**
   * Close RSVP Dialog Modal
   */
  function closeRsvpModal() {
    rsvpModal.close();
    state.selectedEvent = null;
    hideModalAlert();
  }

  /**
   * Handle RSVP Form Submission
   */
  async function handleRsvpSubmit(e) {
    e.preventDefault();
    hideModalAlert();

    const eventId = parseInt(document.getElementById('formEventId').value, 10);
    const attendeeName = document.getElementById('formAttendeeName').value.trim();
    const attendeeEmail = document.getElementById('formAttendeeEmail').value.trim().toLowerCase();
    const department = document.getElementById('formDepartment').value;
    const tickets = parseInt(document.querySelector('input[name="tickets"]:checked').value, 10);

    // Client validation
    if (!attendeeName || attendeeName.length < 2) {
      showModalAlert('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!attendeeEmail || !attendeeEmail.includes('@') || !attendeeEmail.includes('.')) {
      showModalAlert('Please enter a valid college email address.');
      return;
    }

    if (!department) {
      showModalAlert('Please select your academic department.');
      return;
    }

    if (tickets !== 1 && tickets !== 2) {
      showModalAlert('You may reserve either 1 or 2 seats only.');
      return;
    }

    // Check duplicate email locally first as an instant guard
    const isDuplicate = state.registrations.some(
      r => r.eventId === eventId && r.attendeeEmail.toLowerCase() === attendeeEmail
    );

    if (isDuplicate) {
      showModalAlert(`Duplicate Registration Blocked: The email '${attendeeEmail}' is already registered for this workshop.`);
      showToast('Duplicate Email Detected', `Already registered for this workshop with ${attendeeEmail}.`, 'error');
      return;
    }

    // Toggle button loading spinner
    const btnSubmit = document.getElementById('btnSubmitRsvp');
    const spinner = document.getElementById('rsvpSpinner');
    const btnText = document.getElementById('rsvpBtnText');

    btnSubmit.disabled = true;
    spinner.classList.remove('hidden');
    btnText.textContent = 'Verifying Seat Allocation...';

    const payload = {
      eventId,
      attendeeName,
      attendeeEmail,
      department,
      tickets
    };

    try {
      const result = await window.ApiService.createRegistration(payload);

      if (!result.success) {
        // Handle explicit HTTP 409 Conflict (Duplicate Email)
        if (result.status === 409) {
          showModalAlert(`Duplicate Email Error: ${result.message}`);
          showToast('Duplicate Email Blocked', result.message, 'error');
          return;
        }

        // Handle explicit HTTP 400 Bad Request (Capacity Exceeded)
        if (result.status === 400) {
          showModalAlert(`Capacity Error: ${result.message}`);
          showToast('Capacity Exceeded', result.message, 'error');
          return;
        }

        showModalAlert(result.message || 'Unable to complete reservation.');
        return;
      }

      // Success
      const newReg = result.data;

      // Update state locally
      const targetEvent = state.events.find(ev => ev.id === eventId);
      if (targetEvent) {
        targetEvent.registeredSeats += tickets;
        targetEvent.availableSeats = Math.max(0, targetEvent.totalSeats - targetEvent.registeredSeats);
        targetEvent.percentFilled = Math.min(100, Math.round((targetEvent.registeredSeats / targetEvent.totalSeats) * 100));
        if (targetEvent.availableSeats === 0) targetEvent.status = 'SOLD_OUT';
        else if (targetEvent.percentFilled >= 80) targetEvent.status = 'FILLING_FAST';
      }

      state.registrations.unshift({
        id: newReg.id || Date.now(),
        eventId: eventId,
        eventTitle: targetEvent ? targetEvent.title : 'Technical Workshop',
        attendeeName: newReg.attendeeName,
        attendeeEmail: newReg.attendeeEmail,
        department: newReg.department,
        tickets: newReg.tickets,
        registeredAt: newReg.registeredAt || new Date().toISOString(),
        remainingSeats: targetEvent ? targetEvent.availableSeats : 0
      });

      closeRsvpModal();
      renderAll();

      // Show Confirmation Dialog
      document.getElementById('confirmId').textContent = `#REG-${newReg.id || '901'}`;
      document.getElementById('confirmName').textContent = newReg.attendeeName;
      document.getElementById('confirmEvent').textContent = targetEvent ? targetEvent.title : 'Workshop';
      document.getElementById('confirmSeats').textContent = `${newReg.tickets} ${newReg.tickets === 1 ? 'Seat' : 'Seats'}`;
      confirmationModal.showModal();

      showToast('RSVP Confirmed!', `${newReg.tickets} seat(s) reserved for ${newReg.attendeeName}.`, 'success');

    } catch (err) {
      showModalAlert(err.message || 'A network error occurred while contacting the server.');
      showToast('Reservation Error', err.message, 'error');
    } finally {
      btnSubmit.disabled = false;
      spinner.classList.add('hidden');
      btnText.textContent = 'Confirm Reservation';
    }
  }

  /**
   * Handle Roster Table Action Clicks (Cancellation)
   */
  async function handleRosterClick(e) {
    const cancelBtn = e.target.closest('.btn-cancel-rsvp');
    if (!cancelBtn) return;

    const registrationId = parseInt(cancelBtn.dataset.id, 10);
    const attendeeName = cancelBtn.dataset.name;

    const confirmMsg = `Are you sure you want to cancel the RSVP for ${attendeeName}? This will immediately free up seats for other attendees.`;
    if (!window.confirm(confirmMsg)) return;

    cancelBtn.disabled = true;
    cancelBtn.textContent = 'Cancelling...';

    try {
      await window.ApiService.cancelRegistration(registrationId);

      // Find registration to restore event capacity
      const regIndex = state.registrations.findIndex(r => r.id === registrationId);
      if (regIndex !== -1) {
        const removed = state.registrations[regIndex];
        const event = state.events.find(e => e.id === removed.eventId);
        if (event) {
          event.registeredSeats = Math.max(0, event.registeredSeats - removed.tickets);
          event.availableSeats = Math.max(0, event.totalSeats - event.registeredSeats);
          event.percentFilled = Math.min(100, Math.round((event.registeredSeats / event.totalSeats) * 100));
          if (event.availableSeats > 0 && event.percentFilled < 80) event.status = 'AVAILABLE';
        }
        state.registrations.splice(regIndex, 1);
      }

      renderAll();
      showToast('Reservation Cancelled', `Seats returned to the public pool for ${attendeeName}.`, 'info');
    } catch (err) {
      showToast('Cancellation Failed', err.message, 'error');
      cancelBtn.disabled = false;
      cancelBtn.textContent = 'Cancel RSVP';
    }
  }

  /**
   * Modal Alert Helpers
   */
  function showModalAlert(message) {
    if (!modalAlertBanner) return;
    modalAlertBanner.textContent = message;
    modalAlertBanner.classList.remove('hidden');
  }

  function hideModalAlert() {
    if (!modalAlertBanner) return;
    modalAlertBanner.textContent = '';
    modalAlertBanner.classList.add('hidden');
  }

  /**
   * Toast Notifications Helper
   */
  function showToast(title, message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-body">
        <span class="toast-title">${escapeHtml(title)}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  /**
   * Formatting Helpers
   */
  function formatDateTime(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function formatDateShort(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
