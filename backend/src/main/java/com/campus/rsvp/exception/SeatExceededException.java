package com.campus.rsvp.exception;

public class SeatExceededException extends RuntimeException {
    public SeatExceededException(String message) {
        super(message);
    }
}
