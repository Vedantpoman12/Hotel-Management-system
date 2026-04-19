package com.example.hotelmanagement;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "guests")
public class Guest {
    @Id
    private String guestId;
    
    private String name;
    private String contactNumber;
    private String idProof;

    public Guest() {}

    public Guest(String name, String contactNumber, String idProof) {
        this.guestId = UUID.randomUUID().toString();
        this.name = name;
        this.contactNumber = contactNumber;
        this.idProof = idProof;
    }

    public String getGuestId() { return guestId; }
    public void setGuestId(String guestId) { this.guestId = guestId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public String getIdProof() { return idProof; }
    public void setIdProof(String idProof) { this.idProof = idProof; }

    @Override
    public String toString() {
        return "ID: " + guestId + ", Name: " + name + ", Contact: " + contactNumber + ", ID Proof: " + idProof;
    }
}
