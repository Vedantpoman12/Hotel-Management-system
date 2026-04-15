package com.example.hotelmanagement;

import java.util.UUID;

public class Guest {
    private final String guestId;
    private final String name;
    private final String contactNumber;
    private final String idProof;

    public Guest(String name, String contactNumber, String idProof) {
        this.guestId = UUID.randomUUID().toString();
        this.name = name;
        this.contactNumber = contactNumber;
        this.idProof = idProof;
    }

    public String getGuestId() { return guestId; }
    public String getName() { return name; }
    public String getContactNumber() { return contactNumber; }
    public String getIdProof() { return idProof; }

    @Override
    public String toString() {
        return "ID: " + guestId + ", Name: " + name + ", Contact: " + contactNumber + ", ID Proof: " + idProof;
    }
}
