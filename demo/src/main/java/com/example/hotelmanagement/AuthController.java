package com.example.hotelmanagement;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        System.out.println("Login attempt for user: " + username);

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent()) {
            boolean matches = passwordEncoder.matches(password, userOpt.get().getPassword());
            System.out.println("Found user in DB. Password match: " + matches);
            
            if (matches) {
                User user = userOpt.get();
                Map<String, Object> response = new HashMap<>();
                response.put("username", user.getUsername());
                response.put("role", user.getRole().name());
                response.put("fullName", user.getFullName());
                System.out.println("Login SUCCESS for: " + username);
                return ResponseEntity.ok(response);
            }
        } else {
            System.out.println("User NOT FOUND in database: " + username);
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }
}
