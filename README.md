# CSI 2132 Project e-Hotel

## Project Overview
The e-Hotels system is a collaborative platform for five major hotel chains in North America, enabling real-time room booking and management across their properties. This system provides both customer-facing booking capabilities and employee-facing management tools.

## Technologies Used
- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **Frontend**: React with Material-UI
- **Authentication**: JWT (JSON Web Tokens)
- **Development Tools**: Vite, TypeScript

## Installation Guide

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd e-hotels
```

2. Backend Setup:
```bash
cd backend
npm install
npm run init-db  # Initializes database with schema and sample data
npm run dev      # Starts development server on port 5000
```

3. Frontend Setup:
```bash
cd frontend
npm install
npm run dev      # Starts development server on port 5173
```

## Database Implementation

### Schema Overview
The database consists of the following main tables:
- HOTEL_CHAIN
- HOTEL
- ROOM
- CUSTOMER
- EMPLOYEE
- BOOKING
- RENTING
- ARCHIVE

### Key Database Features

#### 1. Views
- **available_rooms_per_area**: Shows number of available rooms by location
- **hotel_room_capacity**: Aggregates room capacity statistics per hotel
- **room_availability**: Real-time room availability status
- **hotel_statistics**: Performance metrics for each hotel
- **employee_performance**: Employee activity tracking

#### 2. Triggers
- **after_hotel_insert/delete**: Maintains hotel count in chains
- **after_renting_insert**: Updates booking status on renting
- **before_booking_insert**: Prevents double bookings
- **before_renting_insert**: Prevents overlapping rentings

#### 3. Indexes
```sql
CREATE INDEX idx_room_hotel ON room(hotel_id);
CREATE INDEX idx_booking_dates ON booking(start_date, end_date);
CREATE INDEX idx_hotel_location ON hotel(address);
```

### Sample Queries

1. Available Rooms Search (with aggregation):
```sql
SELECT h.name, COUNT(r.room_id) as available_rooms, AVG(r.price) as avg_price
FROM hotel h
JOIN room r ON h.hotel_id = r.hotel_id
WHERE r.room_id NOT IN (
    SELECT room_id FROM booking 
    WHERE booking_status != 'cancelled'
    AND current_date BETWEEN start_date AND end_date
)
GROUP BY h.hotel_id;
```

2. Nested Query for Hotel Occupancy:
```sql
SELECT h.name, 
    (SELECT COUNT(*) 
     FROM renting r 
     WHERE r.hotel_id = h.hotel_id 
     AND current_date BETWEEN r.start_date AND r.end_date
    ) as current_occupancy
FROM hotel h;
```

## Application Features

### Customer Features
1. Account Management
   - Registration
   - Login/Logout
   - Profile management

2. Room Booking
   - Search with multiple criteria
   - Real-time availability checking
   - Booking management

### Employee Features
1. Booking Management
   - Convert bookings to rentings
   - Direct room rental
   - Payment processing

2. Hotel Management
   - Room status updates
   - Customer management
   - Booking/renting reports

## Security Implementation

1. Authentication
   - JWT-based authentication
   - Role-based access control
   - Session management

2. Data Protection
   - Password hashing
   - Input validation
   - SQL injection prevention

## Testing

### Database Testing
- Integrity constraints validation
- Trigger functionality testing
- View accuracy verification

### Application Testing
- API endpoint testing
- User interface testing
- Authentication flow testing

## Performance Optimizations

1. Database Optimizations
   - Strategic indexing
   - Query optimization
   - Connection pooling

2. Application Optimizations
   - React component optimization
   - API response caching
   - Lazy loading

## Future Enhancements
1. Additional Features
   - Mobile application
   - Email notifications
   - Payment gateway integration

2. Technical Improvements
   - Real-time updates using WebSocket
   - Enhanced reporting capabilities
   - Advanced search filters

## Video Presentation Timestamps

| Section | Start Time |
|---------|------------|
| Technologies Overview | 00:00 |
| Database Schema | 02:00 |
| Integrity Constraints | 04:00 |
| Data Population | 06:00 |
| SQL Queries Demo | 08:00 |
| Triggers Demo | 10:00 |
| Indexes Overview | 12:00 |
| Views Demo | 13:00 |
| UI Walkthrough | 14:00 |

## Contributors
- [Student Name]
- Student ID: [ID]
- Course: CSI2132 Databases I
- Professor: Verena Kantere
- Winter 2024-25
