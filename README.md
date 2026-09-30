# Hotel Management System

A full-stack hotel management application with a Spring Boot REST API and a React + TypeScript frontend for managing rooms, guests, bookings, services, and hotel operations.

## Features

- Room availability and room management
- Guest registration, booking, check-in, and checkout
- Customer portal and authenticated admin flows
- Guest management and booking history
- Cleaning and room-service workflows
- Dashboard statistics and revenue tracking
- JPA persistence with an H2 database for local development

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.2.4, Spring Web, Spring Data JPA
- **Security:** Spring Security with HTTP Basic authentication and BCrypt passwords
- **Database:** H2 for local development
- **Frontend:** React, TypeScript, React Router, Axios
- **UI:** Tailwind CSS, Framer Motion, Lucide React

## Project Structure

```text
.
└── demo/
    ├── pom.xml
    └── src/main/java/com/example/hotelmanagement/
        └── hotel-ui/
```

## Prerequisites

- JDK 17 or newer
- Node.js and npm

## Setup

Clone the repository and install frontend dependencies:

```bash
git clone https://github.com/Vedantpoman12/Hotel-Management-system.git
cd Hotel-Management-system/demo/src/main/java/com/example/hotelmanagement/hotel-ui
npm install
```

The backend includes a Maven wrapper, so Maven does not need to be installed separately.

## Run Locally

Start the backend from the `demo` directory:

```bash
cd demo

# Windows
mvnw.cmd spring-boot:run

# macOS/Linux
./mvnw spring-boot:run
```

The API is available at `http://localhost:8080`.

In a second terminal, start the frontend:

```bash
cd demo/src/main/java/com/example/hotelmanagement/hotel-ui
npm start
```

Open `http://localhost:3000` in a browser.

## Useful Commands

Run these from `demo/src/main/java/com/example/hotelmanagement/hotel-ui`:

```bash
npm start       # Start the frontend development server
npm run build   # Create a production frontend build
npm test        # Run frontend tests
```

Run backend tests from `demo`:

```bash
# Windows
mvnw.cmd test

# macOS/Linux
./mvnw test
```

## Notes

- The frontend expects the backend at `http://localhost:8080`.
- Local database configuration is in `demo/src/main/resources/application.properties`.
- H2 data is intended for development and testing; configure a production database before deployment.