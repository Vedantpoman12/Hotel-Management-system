package com.example.hotelmanagement;

import jakarta.persistence.*;

@Entity
@Table(name = "extra_services")
public class ExtraService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serviceName;
    private double price;
    private String status = "PENDING"; // PENDING, COMPLETED

    @ManyToOne
    private Booking booking;

    public ExtraService() {}

    public ExtraService(String serviceName, double price, Booking booking) {
        this.serviceName = serviceName;
        this.price = price;
        this.booking = booking;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
}
