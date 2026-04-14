package com.example.hotelmanagement;

public abstract class Room implements Billable {
    private final int roomNumber;
    private boolean isOccupied;
    private final double basePrice;

    public Room(int roomNumber, double basePrice) {
        this.roomNumber = roomNumber;
        this.basePrice = basePrice;
        this.isOccupied = false;
    }

    public int getRoomNumber() { return roomNumber; }
    public boolean isOccupied() { return isOccupied; }
    public double getBasePrice() { return basePrice; }

    public void checkIn() { this.isOccupied = true; }
    public void checkOut() { this.isOccupied = false; }

    public abstract String getRoomType();
    public abstract void displayFeatures();
}
