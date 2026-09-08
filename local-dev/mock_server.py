#!/usr/bin/env python3
"""
Campus AI Workshop & Hackathon RSVP Portal
Zero-Dependency Local Development & API Simulation Server
Serves static frontend files and emulates Spring Boot REST endpoints on Port 5500.
"""

import http.server
import socketserver
import json
import os
import re
from datetime import datetime

PORT = 5500
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

# In-Memory Database State
EVENTS = [
    {
        "id": 1,
        "title": "Generative AI & Agentic Systems Bootcamp",
        "description": "Hands-on masterclass on building multi-agent architectures, reasoning loops, tool calling, and autonomous developer workflows.",
        "speakerName": "Dr. Elena Rostova",
        "speakerTitle": "Principal AI Researcher, DeepMind Alum",
        "department": "Computer Science & Eng",
        "venue": "Turing Hall - Auditorium 101",
        "eventDate": "2026-10-15T09:30:00",
        "totalSeats": 100,
        "registeredSeats": 78,
        "availableSeats": 22,
        "percentFilled": 78.0,
        "status": "AVAILABLE"
    },
    {
        "id": 2,
        "title": "Campus 36-Hour Autonomous Hackathon",
        "description": "Build and deploy end-to-end AI applications, robotics integrations, and edge vision models with compute clusters provided.",
        "speakerName": "Marcus Thorne",
        "speakerTitle": "Senior Director of Platform Engineering",
        "department": "Interdisciplinary AI Lab",
        "venue": "Innovation Hub - Grand Atrium",
        "eventDate": "2026-10-18T18:00:00",
        "totalSeats": 150,
        "registeredSeats": 142,
        "availableSeats": 8,
        "percentFilled": 94.6,
        "status": "FILLING_FAST"
    },
    {
        "id": 3,
        "title": "LLM Fine-Tuning, LoRA & Quantization",
        "description": "Deep dive into parameter-efficient fine-tuning (PEFT), QLoRA, GGUF conversion, and running 70B models on commodity hardware.",
        "speakerName": "Priya Sundaram",
        "speakerTitle": "Staff ML Engineer & Open Source Core",
        "department": "Data Science & Analytics",
        "venue": "Lovelace Lab 304",
        "eventDate": "2026-10-22T14:00:00",
        "totalSeats": 60,
        "registeredSeats": 58,
        "availableSeats": 2,
        "percentFilled": 96.6,
        "status": "FILLING_FAST"
    },
    {
        "id": 4,
        "title": "Computer Vision & Real-time Robotics",
        "description": "Deploying YOLOv10 and Spatial AI models on Jetson Orin Nano boards for autonomous obstacle avoidance.",
        "speakerName": "Prof. David Kim",
        "speakerTitle": "Chair of Robotics & Autonomous Systems",
        "department": "Robotics & Mechatronics",
        "venue": "Robotics Bay West Wing",
        "eventDate": "2026-10-25T10:00:00",
        "totalSeats": 45,
        "registeredSeats": 45,
        "availableSeats": 0,
        "percentFilled": 100.0,
        "status": "SOLD_OUT"
    }
]

REGISTRATIONS = [
    {
        "id": 101,
        "eventId": 1,
        "eventTitle": "Generative AI & Agentic Systems Bootcamp",
        "attendeeName": "Aarav Patel",
        "attendeeEmail": "aarav.patel@campus.edu",
        "department": "Computer Science & Eng",
        "tickets": 2,
        "registeredAt": "2026-10-01T10:15:00",
        "remainingSeats": 22,
        "confirmationMessage": "Active"
    },
    {
        "id": 102,
        "eventId": 1,
        "eventTitle": "Generative AI & Agentic Systems Bootcamp",
        "attendeeName": "Sophia Chen",
        "attendeeEmail": "sophia.chen@campus.edu",
        "department": "Data Science & Analytics",
        "tickets": 1,
        "registeredAt": "2026-10-01T11:30:00",
        "remainingSeats": 22,
        "confirmationMessage": "Active"
    },
    {
        "id": 103,
        "eventId": 1,
        "eventTitle": "Generative AI & Agentic Systems Bootcamp",
        "attendeeName": "Liam O'Connor",
        "attendeeEmail": "liam.oc@campus.edu",
        "department": "Information Technology",
        "tickets": 2,
        "registeredAt": "2026-10-02T09:45:00",
        "remainingSeats": 22,
        "confirmationMessage": "Active"
    },
    {
        "id": 104,
        "eventId": 2,
        "eventTitle": "Campus 36-Hour Autonomous Hackathon",
        "attendeeName": "Zara Khan",
        "attendeeEmail": "zara.k@campus.edu",
        "department": "Computer Science & Eng",
        "tickets": 2,
        "registeredAt": "2026-10-02T14:20:00",
        "remainingSeats": 8,
        "confirmationMessage": "Active"
    },
    {
        "id": 105,
        "eventId": 2,
        "eventTitle": "Campus 36-Hour Autonomous Hackathon",
        "attendeeName": "Ethan Wright",
        "attendeeEmail": "ethan.w@campus.edu",
        "department": "Electronics & Comm",
        "tickets": 2,
        "registeredAt": "2026-10-03T16:10:00",
        "remainingSeats": 8,
        "confirmationMessage": "Active"
    },
    {
        "id": 106,
        "eventId": 3,
        "eventTitle": "LLM Fine-Tuning, LoRA & Quantization",
        "attendeeName": "Maya Lin",
        "attendeeEmail": "maya.lin@campus.edu",
        "department": "Artificial Intelligence",
        "tickets": 1,
        "registeredAt": "2026-10-04T12:00:00",
        "remainingSeats": 2,
        "confirmationMessage": "Active"
    }
]

class DevServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/events"):
            self.handle_get_events()
            return
        elif self.path.startswith("/api/registrations"):
            self.handle_get_registrations()
            return
        # Otherwise fallback to serving static files
        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/registrations":
            self.handle_post_registration()
            return
        self.send_error(404, "Endpoint not found")

    def do_DELETE(self):
        match = re.match(r"^/api/registrations/(\d+)$", self.path)
        if match:
            reg_id = int(match.group(1))
            self.handle_delete_registration(reg_id)
            return
        self.send_error(404, "Endpoint not found")

    # API Handlers
    def handle_get_events(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        response = {"success": True, "message": "Workshops retrieved", "data": EVENTS}
        self.wfile.write(json.dumps(response).encode("utf-8"))

    def handle_get_registrations(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        response = {"success": True, "message": "Registrations retrieved", "data": REGISTRATIONS}
        self.wfile.write(json.dumps(response).encode("utf-8"))

    def handle_post_registration(self):
        content_len = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_len)
        try:
            payload = json.loads(post_body.decode("utf-8"))
        except Exception:
            self._send_json(400, {"success": False, "message": "Invalid JSON payload"})
            return

        event_id = payload.get("eventId")
        attendee_name = payload.get("attendeeName", "").strip()
        attendee_email = payload.get("attendeeEmail", "").strip().lower()
        department = payload.get("department", "").strip()
        tickets = payload.get("tickets", 1)

        # Validation
        if not event_id or not attendee_name or not attendee_email or not department:
            self._send_json(400, {"success": False, "message": "All fields are required"})
            return

        if tickets not in (1, 2):
            self._send_json(400, {"success": False, "message": "Tickets must be either 1 or 2 seats"})
            return

        target_event = next((e for e in EVENTS if e["id"] == event_id), None)
        if not target_event:
            self._send_json(404, {"success": False, "message": "Workshop not found"})
            return

        # 1. Duplicate email detection per workshop (HTTP 409 Conflict)
        duplicate = any(r["eventId"] == event_id and r["attendeeEmail"].lower() == attendee_email for r in REGISTRATIONS)
        if duplicate:
            self._send_json(409, {
                "success": False,
                "message": f"DUPLICATE_REGISTRATION: The email '{attendee_email}' is already registered for '{target_event['title']}'."
            })
            return

        # 2. Capacity headroom verification (HTTP 400 Bad Request)
        available = target_event["totalSeats"] - target_event["registeredSeats"]
        if tickets > available:
            self._send_json(400, {
                "success": False,
                "message": f"CAPACITY_EXCEEDED: Only {available} seat(s) available for '{target_event['title']}'. Cannot reserve {tickets}."
            })
            return

        # 3. Reserve Seats atomically
        target_event["registeredSeats"] += tickets
        target_event["availableSeats"] = target_event["totalSeats"] - target_event["registeredSeats"]
        target_event["percentFilled"] = round((target_event["registeredSeats"] / target_event["totalSeats"]) * 100, 1)
        if target_event["availableSeats"] == 0:
            target_event["status"] = "SOLD_OUT"
        elif target_event["percentFilled"] >= 80:
            target_event["status"] = "FILLING_FAST"

        new_id = max((r["id"] for r in REGISTRATIONS), default=100) + 1
        new_reg = {
            "id": new_id,
            "eventId": event_id,
            "eventTitle": target_event["title"],
            "attendeeName": attendee_name,
            "attendeeEmail": attendee_email,
            "department": department,
            "tickets": tickets,
            "registeredAt": datetime.now().isoformat(),
            "remainingSeats": target_event["availableSeats"],
            "confirmationMessage": f"RSVP Confirmed for {tickets} seat(s)"
        }
        REGISTRATIONS.insert(0, new_reg)

        self._send_json(201, {
            "success": True,
            "message": "Registration created successfully",
            "data": new_reg
        })

    def handle_delete_registration(self, reg_id):
        global REGISTRATIONS
        reg = next((r for r in REGISTRATIONS if r["id"] == reg_id), None)
        if not reg:
            self._send_json(404, {"success": False, "message": "Registration not found"})
            return

        # Restore seats
        target_event = next((e for e in EVENTS if e["id"] == reg["eventId"]), None)
        if target_event:
            target_event["registeredSeats"] = max(0, target_event["registeredSeats"] - reg["tickets"])
            target_event["availableSeats"] = target_event["totalSeats"] - target_event["registeredSeats"]
            target_event["percentFilled"] = round((target_event["registeredSeats"] / target_event["totalSeats"]) * 100, 1)
            if target_event["availableSeats"] > 0 and target_event["percentFilled"] < 80:
                target_event["status"] = "AVAILABLE"

        REGISTRATIONS = [r for r in REGISTRATIONS if r["id"] != reg_id]

        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

def run_server():
    socketserver.TCPServer.allow_reuse_address = False
    with socketserver.TCPServer(("", PORT), DevServerHandler) as httpd:
        print(f"==================================================", flush=True)
        print(f" Campus AI RSVP Portal Dev Server", flush=True)
        print(f" URL: http://localhost:{PORT}", flush=True)
        print(f" Serving frontend & emulating Spring Boot REST API", flush=True)
        print(f"==================================================", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down dev server.", flush=True)

if __name__ == "__main__":
    run_server()
