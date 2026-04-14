package com.example.hotelmanagement;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class HotelController {

    private final HotelManager hotelService;

    @Autowired
    public HotelController(HotelManager hotelService) {
        this.hotelService = hotelService;
    }

    // ─── Rooms ────────────────────────────────────────────────────────
    @GetMapping("/rooms")
    public List<Map<String, Object>> getAllRooms() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Room room : hotelService.getRooms()) {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("roomNumber", room.getRoomNumber());
            r.put("roomType", room.getRoomType());
            r.put("basePrice", room.getBasePrice());
            r.put("occupied", room.isOccupied());
            r.put("status", room.isOccupied() ? "occupied" : "available");
            // Attach guest name if booked
            String guestName = hotelService.getGuestForRoom(room.getRoomNumber());
            r.put("guest", guestName);
            result.add(r);
        }
        return result;
    }

    // ─── Bookings ──────────────────────────────────────────────────────
    @GetMapping("/bookings")
    public List<Map<String, Object>> getBookings() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Booking b : hotelService.getBookings()) {
            Map<String, Object> bMap = new LinkedHashMap<>();
            bMap.put("room", b.getRoom().getRoomNumber());
            bMap.put("roomType", b.getRoom().getRoomType());
            bMap.put("guestName", b.getGuest().getName());
            bMap.put("guestContact", b.getGuest().getContactNumber());
            bMap.put("duration", b.getDuration());
            bMap.put("checkIn", b.getCheckInDate().toString());
            bMap.put("checkOut", b.getCheckOutDate().toString());
            bMap.put("totalAmount", b.getRoom().calculateBill(b.getDuration()));
            result.add(bMap);
        }
        return result;
    }

    // ─── Book a room ───────────────────────────────────────────────────
    @PostMapping("/book")
    public ResponseEntity<Map<String, Object>> bookRoom(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new LinkedHashMap<>();
        try {
            int roomNumber = Integer.parseInt(payload.get("roomNumber").toString());
            String firstName = payload.getOrDefault("firstName", "").toString();
            String lastName  = payload.getOrDefault("lastName", "").toString();
            String name      = (firstName + " " + lastName).trim();
            String contact   = payload.getOrDefault("phone", "N/A").toString();
            String idProof   = payload.getOrDefault("email", "N/A").toString();
            int duration     = Integer.parseInt(payload.getOrDefault("nights", "1").toString());

            Guest guest  = new Guest(name, contact, idProof);
            boolean ok   = hotelService.bookRoom(roomNumber, guest, duration);

            if (ok) {
                response.put("success", true);
                response.put("message", "Booking confirmed for room " + roomNumber);
                response.put("roomNumber", roomNumber);
                response.put("guest", name);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Room " + roomNumber + " is not available");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Invalid request: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ─── Check-out ─────────────────────────────────────────────────────
    @PostMapping("/checkout/{roomNumber}")
    public ResponseEntity<Map<String, Object>> checkOut(@PathVariable int roomNumber) {
        Map<String, Object> response = new LinkedHashMap<>();
        Map<String, Object> bill = hotelService.checkOut(roomNumber);
        if (bill != null) {
            response.put("success", true);
            response.putAll(bill);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "No active booking found for room " + roomNumber);
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ─── Dashboard Stats ───────────────────────────────────────────────
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return hotelService.getDashboardStats();
    }
}