package com.example.hotelmanagement;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "extra_services")
@Getter
@Setter
@NoArgsConstructor
public class ExtraService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serviceName;
    private double price;
    private String status = "PENDING"; // PENDING, COMPLETED

    @ManyToOne
    private Booking booking;

    public ExtraService(String serviceName, double price, Booking booking) {
        this.serviceName = serviceName;
        this.price = price;
        this.booking = booking;
    }
}
