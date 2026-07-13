# Charge X

## Overview
The Charge X system is a comprehensive platform designed to facilitate the operations of electric vehicle (EV) battery swapping networks. It manages the full lifecycle of battery swapping, ranging from driver interactions and battery tracking to station operations and administrative oversight. The system features a centralised backend architecture and distributed frontend portals for different user roles.

## Architecture
The platform is built using a modern technology stack separated into backend and frontend components.

### Backend
- **Framework**: Spring Boot (Java)
- **Database**: Relational Database (JPA/Hibernate)
- **Security**: Spring Security with JWT Authentication
- **Build Tool**: Maven

### Frontend
- **Framework**: React with TypeScript
- **Portals**:
  - `user`: Portal for EV drivers to link batteries, request swaps, and manage their profiles.
  - `staff`: Portal for station staff to process battery swaps and monitor station capacity.
  - `admin`: Portal for system administrators to oversee network health, manage users, and configure stations.

## Key Features

### Driver Operations
- **Battery Linking**: Allows new drivers to register and link their physical batteries to their accounts using specific model prefixes and serial numbers.
- **Battery Swapping (Swap & Rent)**: Streamlines the process of exchanging depleted batteries for fully charged ones at designated stations.
- **Wallet and Vouchers**: Built-in wallet system for transaction processing and voucher redemption.
- **Support & Feedback**: Integrated support ticket system and station review capabilities.

### Station Operations (Staff)
- **Inventory Management**: Real-time tracking of available, charging, and rented batteries at a specific station.
- **Diagnostics**: State of Health (SoH) tracking and calculation upon battery return or charge completion.
- **Order Fulfillment**: Processing swap orders initiated by drivers.

### Administrative Management
- **Network Oversight**: Global view of all stations, batteries, and users.
- **User Management**: Role-based access control and staff assignment.
- **Financials**: Monitoring platform-wide transactions, wallet top-ups, and revenue.

## Getting Started

### Prerequisites
- Java Development Kit (JDK) 21 or higher
- Node.js (v16+) and npm/yarn
- PostgreSQL

### Backend Setup
1. Navigate to the project root directory.
2. Configure your database connection in `src/main/resources/application.properties` (or `.yml`).
3. Build the project using Maven:
   ```bash
   ./mvnw clean install
   ```
4. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to the desired frontend application directory (e.g., `frontend/user`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
