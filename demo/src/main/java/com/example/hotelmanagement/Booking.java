package com.example.hotelmanagement;

import java.time.LocalDate;

public class Booking {
    private final Guest guest;
    private final Room room;
    private final int duration; // in days
    private final LocalDate checkInDate;
    private final LocalDate checkOutDate;

    public Booking(Guest guest, Room room, LocalDate checkInDate, int duration) {
        this.guest = guest;
        this.room = room;
        this.duration = duration;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkInDate.plusDays(duration);
    }

    public Guest getGuest()           { return guest; }
    public Room getRoom()             { return room; }
    public int getDuration()          { return duration; }
    public LocalDate getCheckInDate() { return checkInDate; }
    public LocalDate getCheckOutDate(){ return checkOutDate; }
}
