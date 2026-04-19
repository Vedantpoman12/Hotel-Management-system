package com.example.hotelmanagement;

import jakarta.persistence.*;

@Entity
@Table(name = "rooms")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "room_type")
public abstract class Room implements Billable {
    @Id
    private int roomNumber;
    
    private boolean isOccupied;
    private double basePrice;
    
    @Enumerated(EnumType.STRING)
    private RoomStatus status = RoomStatus.AVAILABLE;

    public Room() {}

    public Room(int roomNumber, double basePrice) {
        this.roomNumber = roomNumber;
        this.basePrice = basePrice;
        this.isOccupied = false;
    }

    public int getRoomNumber() { return roomNumber; }
    public void setRoomNumber(int roomNumber) { this.roomNumber = roomNumber; }
    public boolean isOccupied() { return isOccupied; }
    public void setOccupied(boolean isOccupied) { this.isOccupied = isOccupied; }
    public double getBasePrice() { return basePrice; }
    public void setBasePrice(double basePrice) { this.basePrice = basePrice; }
    public RoomStatus getStatus() { return status; }
    public void setStatus(RoomStatus status) { this.status = status; }

    public void checkIn() { 
        this.isOccupied = true; 
        this.status = RoomStatus.OCCUPIED;
    }
    public void checkOut() { 
        this.isOccupied = false; 
        this.status = RoomStatus.CLEANING;
    }

    public abstract String getRoomType();
    public abstract void displayFeatures();
}
