-- ==========================================================
-- Campus AI Workshop & Hackathon RSVP Portal
-- Database Schema for MySQL 8.0 (InnoDB)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS campus_rsvp_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_rsvp_db;

-- 1. Table: campus_events
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS campus_events;

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
    registered_seats INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_seats_positive CHECK (total_seats > 0),
    CONSTRAINT chk_seats_registered CHECK (registered_seats >= 0 AND registered_seats <= total_seats)
) ENGINE=InnoDB;

-- 2. Table: registrations
CREATE TABLE registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    attendee_name VARCHAR(100) NOT NULL,
    attendee_email VARCHAR(150) NOT NULL,
    department VARCHAR(80) NOT NULL,
    tickets INT NOT NULL DEFAULT 1,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event FOREIGN KEY (event_id)
        REFERENCES campus_events(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_tickets_range CHECK (tickets IN (1, 2)),
    CONSTRAINT uk_event_email UNIQUE (event_id, attendee_email)
) ENGINE=InnoDB;

-- Indexes for high-frequency queries
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_email ON registrations(attendee_email);
CREATE INDEX idx_campus_events_dept ON campus_events(department);
