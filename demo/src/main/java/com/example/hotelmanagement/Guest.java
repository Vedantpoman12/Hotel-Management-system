package com.example.hotelmanagement;

public class Guest {
    private final String name;
    private final String contactNumber;
    private final String idProof;

    public Guest(String name, String contactNumber, String idProof) {
        this.name = name;
        this.contactNumber = contactNumber;
        this.idProof = idProof;
    }

    public String getName() { return name; }
    public String getContactNumber() { return contactNumber; }
    public String getIdProof() { return idProof; }

    @Override
    public String toString() {
        return "Name: " + name + ", Contact: " + contactNumber + ", ID: " + idProof;
    }
}
