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
    private final List<Guest>   allGuests;
    private final List<ExtraService> servicesList;

    public HotelManager() {
        rooms     = new ArrayList<>();
        bookings  = new ArrayList<>();
        allGuests = new ArrayList<>();
        servicesList = new ArrayList<>();
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
                if (room.getStatus() == RoomStatus.AVAILABLE) {
                    room.checkIn();
                    bookings.add(new Booking(guest, room, LocalDate.now(), duration));
                    // Store in allGuests if new
                    boolean exists = allGuests.stream()
                        .anyMatch(g -> g.getContactNumber().equals(guest.getContactNumber()));
                    if (!exists) allGuests.add(guest);
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
    public List<Guest>   getAllGuests() { return allGuests; }

    // ─── Room Management ───────────────────────────────────────────────
    public void addRoom(Room room) {
        rooms.add(room);
    }

    public boolean removeRoom(int roomNumber) {
        return rooms.removeIf(r -> r.getRoomNumber() == roomNumber && !r.isOccupied());
    }

    public boolean updateRoomPrice(int roomNumber, double newPrice) {
        // Since Room stores basePrice as final, we'd need to modify Room.java
        // For now, let's keep it simple or modify Room.java later.
        return false;
    }

    // ─── Extra Services ────────────────────────────────────────────────
    public boolean addServiceToRoom(int roomNumber, String serviceName, double price) {
        Booking found = null;
        for (Booking b : bookings) {
            if (b.getRoom().getRoomNumber() == roomNumber) {
                found = b;
                break;
            }
        }
        if (found == null) return false;

        ExtraService s = new ExtraService(serviceName, price, found);
        s.setId((long) (servicesList.size() + 1));
        servicesList.add(s);
        return true;
    }

    public List<Map<String, Object>> getPendingServices() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (ExtraService s : servicesList) {
            if ("PENDING".equals(s.getStatus())) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", s.getId());
                map.put("serviceName", s.getServiceName());
                map.put("price", s.getPrice());
                map.put("roomNumber", s.getBooking().getRoom().getRoomNumber());
                map.put("guest", s.getBooking().getGuest().getName());
                list.add(map);
            }
        }
        return list;
    }

    public boolean completeService(long id) {
        for (ExtraService s : servicesList) {
            if (s.getId() != null && s.getId() == id) {
                s.setStatus("COMPLETED");
                return true;
            }
        }
        return false;
    }

    // ─── Cleaning ──────────────────────────────────────────────────────
    public boolean markRoomReady(int roomNumber) {
        for (Room r : rooms) {
            if (r.getRoomNumber() == roomNumber) {
                // Should only be ready if it's currently cleaning or maintenance
                r.setStatus(RoomStatus.AVAILABLE);
                return true;
            }
        }
        return false;
    }
}
