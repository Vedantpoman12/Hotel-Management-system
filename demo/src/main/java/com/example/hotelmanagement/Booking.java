package com.example.hotelmanagement;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Guest guest;

    @ManyToOne
    private Room room;

    private int duration; // in days
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private boolean active = true;

    public Booking() {}

    public Booking(Guest guest, Room room, LocalDate checkInDate, int duration) {
        this.guest = guest;
        this.room = room;
        this.duration = duration;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkInDate.plusDays(duration);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Guest getGuest() { return guest; }
    public void setGuest(Guest guest) { this.guest = guest; }
    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }
    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }
    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }
    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
