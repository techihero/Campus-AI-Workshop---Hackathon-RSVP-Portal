-- ==========================================================
-- Campus AI Workshop & Hackathon RSVP Portal
-- Seed Data for campus_events & initial registrations
-- ==========================================================

INSERT INTO campus_events (id, title, description, speaker_name, speaker_title, department, venue, event_date, total_seats, registered_seats)
VALUES
(1, 'Generative AI & Agentic Systems Bootcamp', 
    'Hands-on masterclass on building multi-agent architectures, reasoning loops, tool calling, and autonomous developer workflows.', 
    'Dr. Elena Rostova', 'Principal AI Researcher, DeepMind Alum', 'Computer Science & Eng', 'Turing Hall - Auditorium 101', 
    '2026-10-15 09:30:00', 100, 78),

(2, 'Campus 36-Hour Autonomous Hackathon', 
    'Build and deploy end-to-end AI applications, robotics integrations, and edge vision models with compute clusters provided.', 
    'Marcus Thorne', 'Senior Director of Platform Engineering', 'Interdisciplinary AI Lab', 'Innovation Hub - Grand Atrium', 
    '2026-10-18 18:00:00', 150, 142),

(3, 'LLM Fine-Tuning, LoRA & Quantization', 
    'Deep dive into parameter-efficient fine-tuning (PEFT), QLoRA, GGUF conversion, and running 70B models on commodity hardware.', 
    'Priya Sundaram', 'Staff ML Engineer & Open Source Core', 'Data Science & Analytics', 'Lovelace Lab 304', 
    '2026-10-22 14:00:00', 60, 58),

(4, 'Computer Vision & Real-time Robotics', 
    'Deploying YOLOv10 and Spatial AI models on Jetson Orin Nano boards for autonomous obstacle avoidance.', 
    'Prof. David Kim', 'Chair of Robotics & Autonomous Systems', 'Robotics & Mechatronics', 'Robotics Bay West Wing', 
    '2026-10-25 10:00:00', 45, 45);

-- Seed registrations for workshop 1, 2, 3
INSERT INTO registrations (event_id, attendee_name, attendee_email, department, tickets, registered_at)
VALUES
(1, 'Aarav Patel', 'aarav.patel@campus.edu', 'Computer Science & Eng', 2, '2026-10-01 10:15:00'),
(1, 'Sophia Chen', 'sophia.chen@campus.edu', 'Data Science', 1, '2026-10-01 11:30:00'),
(1, 'Liam O''Connor', 'liam.oc@campus.edu', 'Information Technology', 2, '2026-10-02 09:45:00'),
(2, 'Zara Khan', 'zara.k@campus.edu', 'Computer Science & Eng', 2, '2026-10-02 14:20:00'),
(2, 'Ethan Wright', 'ethan.w@campus.edu', 'Electronics & Comm', 2, '2026-10-03 16:10:00'),
(3, 'Maya Lin', 'maya.lin@campus.edu', 'Artificial Intelligence', 1, '2026-10-04 12:00:00');
