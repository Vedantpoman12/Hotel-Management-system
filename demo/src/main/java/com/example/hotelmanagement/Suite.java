package com.example.hotelmanagement;

public class Suite extends Room {
    public Suite(int roomNumber) {
        super(roomNumber, 4500.0);
    }

    @Override
    public double calculateBill(int duration) {
        return getBasePrice() * duration + 1000.0; // Luxury service charge per stay
    }

    @Override
    public String getRoomType() { return "Suite"; }

    @Override
    public void displayFeatures() {
        System.out.println("Features: Panoramic view, Private lounge, Jacuzzi.");
    }
}
