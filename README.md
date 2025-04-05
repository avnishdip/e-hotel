# Hotel Management System

A web-based hotel management system that allows hotel employees to manage bookings and rentings.

## Features

- User authentication (employees and customers)
- Hotel chain and hotel management
- Room management
- Booking management
- Renting management
- Payment processing

## Technologies Used

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express
- Database: SQLite

## Project Structure

```
hotel-management-system/
├── backend/                # Backend server
│   ├── data/               # Database files
│   ├── scripts/            # Database setup scripts
│   └── src/                # Source code
│       ├── controllers/    # Request handlers
│       ├── middleware/     # Express middleware
│       ├── models/         # Data models
│       ├── routes/         # API routes
│       └── server.js       # Entry point
└── frontend/               # Frontend application
    ├── public/             # Static assets
    └── src/                # Source code
        ├── components/     # React components
        ├── pages/          # Page components
        ├── services/       # API services
        └── App.tsx         # Entry point
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   ```
   node scripts/fresh-setup.js
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Open your browser and navigate to http://localhost:5173
2. Log in with the following credentials:
   - Employee: john.manager@luxurystays.com / password123
   - Customer: alice@example.com / password123

## API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/register - User registration

### Hotels
- GET /api/hotels - Get all hotels
- GET /api/hotels/:id - Get hotel by ID

### Rooms
- GET /api/rooms/hotel/:hotelId - Get rooms by hotel ID

### Bookings
- GET /api/bookings/hotel/:hotelId - Get bookings by hotel ID
- POST /api/bookings - Create a new booking
- PUT /api/bookings/:id - Update booking status

### Rentings
- GET /api/rentings/hotel/:hotelId - Get rentings by hotel ID
- POST /api/rentings - Create a new renting
- PUT /api/rentings/:id/payment - Process payment for a renting

## Database Schema

The system uses the following database tables:
- hotel_chain
- hotel
- room
- employee
- customer
- booking
- renting

## Author

[Your Name]
