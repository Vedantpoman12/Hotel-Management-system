package com.example.hotelmanagement;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class HotelManager {
    private final List<Room>    rooms;
    private final List<Booking> bookings;

    public HotelManager() {
        rooms    = new ArrayList<>();
        bookings = new ArrayList<>();
        initializeRooms();
    }

    // ─── Init ──────────────────────────────────────────────────────────
    private void initializeRooms() {
        for (int i = 101; i <= 110; i++) rooms.add(new StandardRoom(i));
        for (int i = 201; i <= 205; i++) rooms.add(new DeluxeRoom(i));
        for (int i = 301; i <= 302; i++) rooms.add(new Suite(i));
    }

    // ─── Book ──────────────────────────────────────────────────────────
    public boolean bookRoom(int roomNumber, Guest guest, int duration) {
        for (Room room : rooms) {
            if (room.getRoomNumber() == roomNumber) {
                if (!room.isOccupied()) {
                    room.checkIn();
                    bookings.add(new Booking(guest, room, LocalDate.now(), duration));
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    // ─── Check-out ─────────────────────────────────────────────────────
    public Map<String, Object> checkOut(int roomNumber) {
        Booking found = null;
        for (Booking b : bookings) {
            if (b.getRoom().getRoomNumber() == roomNumber) { found = b; break; }
        }
        if (found == null) return null;

        double bill = found.getRoom().calculateBill(found.getDuration());
        found.getRoom().checkOut();
        bookings.remove(found);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("message",    "Check-out successful");
        summary.put("roomNumber", roomNumber);
        summary.put("roomType",   found.getRoom().getRoomType());
        summary.put("guestName",  found.getGuest().getName());
        summary.put("duration",   found.getDuration());
        summary.put("totalBill",  bill);
        return summary;
    }

    // ─── Guest for room ────────────────────────────────────────────────
    public String getGuestForRoom(int roomNumber) {
        for (Booking b : bookings) {
            if (b.getRoom().getRoomNumber() == roomNumber)
                return b.getGuest().getName();
        }
        return null;
    }

    // ─── Dashboard Stats ───────────────────────────────────────────────
    public Map<String, Object> getDashboardStats() {
        int total     = rooms.size();
        int occupied  = (int) rooms.stream().filter(Room::isOccupied).count();
        int available = total - occupied;
        int arrivals  = bookings.size(); // same-day bookings as proxy

        double revenue = bookings.stream()
            .mapToDouble(b -> b.getRoom().calculateBill(b.getDuration()))
            .sum();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalRooms",     total);
        stats.put("occupiedRooms",  occupied);
        stats.put("availableRooms", available);
        stats.put("occupancyRate",  total == 0 ? 0 : Math.round((occupied * 100.0) / total));
        stats.put("activeBookings", arrivals);
        stats.put("totalGuests",    bookings.stream().mapToLong(b -> 1).sum());
        stats.put("dailyRevenue",   Math.round(revenue * 100.0) / 100.0);
        stats.put("arrivals",       arrivals);
        stats.put("departures",     0); // no persistent history yet
        return stats;
    }

    // ─── Console stubs (keep Main.java compiling) ─────────────────────
    public void viewAvailableRooms() {
        rooms.stream().filter(r -> !r.isOccupied())
            .forEach(r -> System.out.printf("Room %d (%s) $%.2f/day%n",
                r.getRoomNumber(), r.getRoomType(), r.getBasePrice()));
    }

    public void displayGuestRecord() {
        if (bookings.isEmpty()) { System.out.println("No guests checked in."); return; }
        bookings.forEach(b -> System.out.printf("Room %d | %s | %s%n",
            b.getRoom().getRoomNumber(), b.getGuest().getName(), b.getGuest().getContactNumber()));
    }

    // ─── Accessors ─────────────────────────────────────────────────────
    public List<Room>    getRooms()    { return rooms; }
    public List<Booking> getBookings() { return bookings; }
}
