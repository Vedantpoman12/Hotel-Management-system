package com.example.hotelmanagement;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        HotelManager manager = new HotelManager();
        try (Scanner scanner = new Scanner(System.in)) {

        System.out.println("=========================================");
        System.out.println("  Welcome to the Hotel Management System  ");
        System.out.println("=========================================");

        while (true) {
            System.out.println("\n--- Main Menu ---");
            System.out.println("1. View Available Rooms");
            System.out.println("2. Book a Room (Check-in)");
            System.out.println("3. Display Guest Record");
            System.out.println("4. Check-out (Calculate Bill)");
            System.out.println("5. Exit");
            System.out.print("Enter your choice: ");
            
            String choiceStr = scanner.nextLine();
            int choice;
            try {
                choice = Integer.parseInt(choiceStr.trim());
            } catch (NumberFormatException e) {
                System.out.println("Invalid input. Please enter a number.");
                continue;
            }

            switch (choice) {
                case 1:
                    manager.viewAvailableRooms();
                    break;
                case 2:
                    System.out.print("Enter Guest Name: ");
                    String name = scanner.nextLine();
                    System.out.print("Enter Contact Number: ");
                    String contact = scanner.nextLine();
                    System.out.print("Enter ID Proof Details: ");
                    String idProof = scanner.nextLine();
                    
                    Guest newGuest = new Guest(name, contact, idProof);
                    
                    System.out.print("Enter desired Room Number: ");
                    int roomNum;
                    try {
                        roomNum = Integer.parseInt(scanner.nextLine().trim());
                    } catch (NumberFormatException e) {
                        System.out.println("Invalid room number.");
                        break;
                    }
                    
                    System.out.print("Enter duration of stay (days): ");
                    int duration;
                    try {
                        duration = Integer.parseInt(scanner.nextLine().trim());
                    } catch (NumberFormatException e) {
                        System.out.println("Invalid duration.");
                        break;
                    }
                    
                    manager.bookRoom(roomNum, newGuest, duration);
                    break;
                case 3:
                    manager.displayGuestRecord();
                    break;
                case 4:
                    System.out.print("Enter Room Number to check out: ");
                    int checkOutRoomNum;
                    try {
                        checkOutRoomNum = Integer.parseInt(scanner.nextLine().trim());
                    } catch (NumberFormatException e) {
                        System.out.println("Invalid room number.");
                        break;
                    }
                    java.util.Map<String,Object> bill = manager.checkOut(checkOutRoomNum);
                    if (bill != null) bill.forEach((k,v) -> System.out.println(k + ": " + v));
                    else System.out.println("No booking found for room " + checkOutRoomNum);
                    break;
                case 5:
                    System.out.println("\nExiting the Hotel Management System. Have a nice day!");
                    return;
                default:
                    System.out.println("Invalid choice. Please choose between 1 and 5.");
            }
        }
        }
    }
}
