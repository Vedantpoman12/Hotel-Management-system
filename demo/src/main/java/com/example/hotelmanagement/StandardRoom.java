package com.example.hotelmanagement;

public class StandardRoom extends Room {
    public StandardRoom(int roomNumber) {
        super(roomNumber, 1500.0); // Base price for standard
    }

    @Override
    public double calculateBill(int duration) {
        return getBasePrice() * duration; 
    }

    @Override
    public String getRoomType() { return "Standard"; }

    @Override
    public void displayFeatures() {
        System.out.println("Features: Basic amenities.");
    }
}
