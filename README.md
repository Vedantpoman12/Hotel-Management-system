# Hotel Management System
 
A full-stack hotel management platform developed to streamline room administration and guest tracking. The project integrates a **Java Spring Boot** backend with a **React.js TypeScript** frontend.
 
---
 
## Workspace Configuration
 
The project operates from the root directory: `HOTEL MANAGEMENT SYSTEM`
 
### Directory Structure
 
```
HOTEL MANAGEMENT SYSTEM/
├── demo/                                               ← Backend (Spring Boot)
│   └── src/
│       └── main/
│           └── java/
│               └── com/
│                   └── example/
│                       └── hotelmanagement/
│                           └── hotel-ui/               ← Frontend (React + TypeScript)
```
 
---
 
## Installation and Setup
 
### 1. Backend Dependencies (Java)
 
Requires **JDK 17+** and **Maven**.
 
```bash
# Navigate to the backend folder
cd demo
 
# Install dependencies
./mvnw install
```
 
### 2. Frontend Dependencies (React)
 
Requires **Node.js** and **npm**.
 
```bash
# Navigate to the UI folder
cd demo/src/main/java/com/example/hotelmanagement/hotel-ui
 
# Install libraries
npm install
```
 
---
 
## Running the Project
 
Start the services in this order to ensure the frontend can consume API data:
 
### Step 1 — Start the Backend API
 
From the `demo/` directory:
 
```bash
# Windows
mvnw.cmd spring-boot:run
 
# Mac / Linux
./mvnw spring-boot:run
```
 
API will be available at: `http://localhost:8080`
 
### Step 2 — Start the Frontend Interface
 
In a **new terminal**, from the `hotel-ui/` directory:
 
```bash
npm start
```
 
Dashboard will launch at: `http://localhost:3000`
 
---
 
## Technical Features
 
| Feature | Description |
|---|---|
| **Full-Stack Integration** | RESTful API bridging Java business logic with a React interface |
| **TypeScript** | Strict type checking for robust frontend data handling |
| **Tailwind CSS** | Utility-first CSS for a modern, responsive UI |
<<<<<<< HEAD
| **CORS Handling** | Configured on the backend to allow cross-origin requests during development |
=======
| **CORS Handling** | Configured on the backend to allow cross-origin requests during development |
>>>>>>> df612ff33a7599606a99d1c75a9f06b93abca214
