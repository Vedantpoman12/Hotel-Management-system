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
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

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
            r.put("status", room.getStatus().name());
            // Attach guest details if booked
            String guestName = hotelService.getGuestForRoom(room.getRoomNumber());
            r.put("guest", guestName);
            result.add(r);
        }
        return result;
    }

    @PostMapping("/rooms")
    public ResponseEntity<String> addRoom(@RequestBody Map<String, Object> payload) {
        try {
            int num = Integer.parseInt(payload.get("roomNumber").toString());
            String type = payload.getOrDefault("type", "Standard").toString();
            
            Room room;
            if (type.equalsIgnoreCase("Deluxe")) room = new DeluxeRoom(num);
            else if (type.equalsIgnoreCase("Suite")) room = new Suite(num);
            else room = new StandardRoom(num);
            
            hotelService.addRoom(room);
            return ResponseEntity.ok("Room " + num + " added successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/rooms/{roomNumber}")
    public ResponseEntity<String> removeRoom(@PathVariable int roomNumber) {
        if (hotelService.removeRoom(roomNumber)) {
            return ResponseEntity.ok("Room " + roomNumber + " removed.");
        }
        return ResponseEntity.badRequest().body("Room not found or currently occupied.");
    }

    // ─── Bookings ──────────────────────────────────────────────────────
    @GetMapping("/bookings")
    public List<Map<String, Object>> getBookings() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Booking b : hotelService.getBookings()) {
            Map<String, Object> bMap = new LinkedHashMap<>();
            
            Map<String, Object> gMap = new LinkedHashMap<>();
            gMap.put("name", b.getGuest().getName());
            gMap.put("contactNumber", b.getGuest().getContactNumber());
            gMap.put("idProof", b.getGuest().getIdProof());
            bMap.put("guest", gMap);

            Map<String, Object> rMap = new LinkedHashMap<>();
            rMap.put("roomNumber", b.getRoom().getRoomNumber());
            rMap.put("roomType", b.getRoom().getRoomType());
            bMap.put("room", rMap);

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
            String idProof   = payload.getOrDefault("idProof", "N/A").toString();
            int duration     = Integer.parseInt(payload.getOrDefault("nights", "1").toString());

            Guest guest  = new Guest(name, contact, idProof);
            boolean ok   = hotelService.bookRoom(roomNumber, guest, duration);

            if (ok) {
                // Generates Digital Room Keys
                String username = "room" + roomNumber;
                String rawPassword = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
                
                User existingUser = userRepository.findByUsername(username).orElse(null);
                if (existingUser != null) {
                    existingUser.setPassword(passwordEncoder.encode(rawPassword));
                    existingUser.setFullName(name);
                    userRepository.save(existingUser);
                } else {
                    userRepository.save(new User(username, passwordEncoder.encode(rawPassword), name, UserRole.CUSTOMER));
                }

                response.put("success", true);
                response.put("message", "Booking confirmed for room " + roomNumber);
                response.put("roomNumber", roomNumber);
                response.put("guest", name);
                response.put("portalUsername", username);
                response.put("portalPassword", rawPassword);
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
            // Revoke Digital Room Key Access
            User existingUser = userRepository.findByUsername("room" + roomNumber).orElse(null);
            if (existingUser != null) {
                existingUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                userRepository.save(existingUser);
            }

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

    // ─── Guest Management ─────────────────────────────────────────────
    @GetMapping("/guests")
    public List<Guest> getAllGuests() {
        return hotelService.getAllGuests();
    }

    // ─── Extra Services ────────────────────────────────────────────────
    @PostMapping("/bookings/{roomNumber}/services")
    public ResponseEntity<Map<String, Object>> addService(@PathVariable int roomNumber, @RequestBody Map<String, Object> payload) {
        String serviceName = payload.get("serviceName").toString();
        double price = Double.parseDouble(payload.get("price").toString());
        boolean ok = hotelService.addServiceToRoom(roomNumber, serviceName, price);
        
        Map<String, Object> res = new HashMap<>();
        res.put("success", ok);
        if (ok) {
            res.put("message", "Service added");
            return ResponseEntity.ok(res);
        } else {
            res.put("message", "Could not find active booking for room " + roomNumber);
            return ResponseEntity.badRequest().body(res);
        }
    }

    @GetMapping("/services/pending")
    public List<Map<String, Object>> getPendingServices() {
        return hotelService.getPendingServices();
    }

    @PostMapping("/services/{id}/complete")
    public ResponseEntity<String> completeService(@PathVariable long id) {
        if (hotelService.completeService(id)) {
            return ResponseEntity.ok("Service completed");
        }
        return ResponseEntity.badRequest().body("Service not found");
    }

    // ─── Cleaning ──────────────────────────────────────────────────────
    @PostMapping("/rooms/{roomNumber}/ready")
    public ResponseEntity<Map<String, Object>> markRoomReady(@PathVariable int roomNumber) {
        boolean ok = hotelService.markRoomReady(roomNumber);
        Map<String, Object> res = new HashMap<>();
        res.put("success", ok);
        if (ok) {
            res.put("message", "Room ready");
            return ResponseEntity.ok(res);
        } else {
            res.put("message", "Room not found or couldn't be marked ready");
            return ResponseEntity.badRequest().body(res);
        }
    }
}