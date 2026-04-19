package com.example.hotelmanagement;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize Users
        if (userRepository.count() == 0) {
            userRepository.save(new User("admin", passwordEncoder.encode("admin123"), "System Admin", UserRole.ADMIN));
            userRepository.save(new User("customer", passwordEncoder.encode("cust123"), "John Doe", UserRole.CUSTOMER));
            System.out.println("Default users initialized.");
        }
        
        System.out.println("--- Registered Users in DB ---");
        userRepository.findAll().forEach(u -> System.out.println("User: " + u.getUsername() + " | Role: " + u.getRole()));
        System.out.println("-------------------------------");

        if (roomRepository.count() == 0) {
            // Initialize Rooms
            for (int i = 101; i <= 110; i++) roomRepository.save(new StandardRoom(i));
            for (int i = 201; i <= 205; i++) roomRepository.save(new DeluxeRoom(i));
            for (int i = 301; i <= 302; i++) roomRepository.save(new Suite(i));
            System.out.println("Default rooms initialized in database.");
        }
    }
}
