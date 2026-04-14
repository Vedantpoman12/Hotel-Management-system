package com.example.hotelmanagement;

public class DeluxeRoom extends Room {
    public DeluxeRoom(int roomNumber) {
        super(roomNumber, 200.0);
    }

    @Override
    public double calculateBill(int duration) {
        return getBasePrice() * duration + 50.0; // Fixed mini-bar/balcony charge per stay
    }

    @Override
    public String getRoomType() { return "Deluxe"; }

    @Override
    public void displayFeatures() {
        System.out.println("Features: Balcony, Mini-bar, Premium bedding.");
    }
}
