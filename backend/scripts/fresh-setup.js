const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Delete existing database file if it exists
const dbPath = path.join(__dirname, '../data/hotel.db');
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
}

// Create new database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to database');
});

// Create tables
const setupQueries = [
    // Hotel Chain table
    `CREATE TABLE IF NOT EXISTS hotel_chain (
        chain_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        headquarters TEXT NOT NULL
    )`,

    // Hotel table
    `CREATE TABLE IF NOT EXISTS hotel (
        hotel_id INTEGER PRIMARY KEY AUTOINCREMENT,
        chain_id INTEGER,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        FOREIGN KEY (chain_id) REFERENCES hotel_chain(chain_id)
    )`,

    // Room table
    `CREATE TABLE IF NOT EXISTS room (
        room_id INTEGER PRIMARY KEY AUTOINCREMENT,
        hotel_id INTEGER,
        room_number TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id)
    )`,

    // Employee table
    `CREATE TABLE IF NOT EXISTS employee (
        employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
        hotel_id INTEGER,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id)
    )`,

    // Customer table
    `CREATE TABLE IF NOT EXISTS customer (
        customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        address TEXT
    )`,

    // Booking table
    `CREATE TABLE IF NOT EXISTS booking (
        booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        hotel_id INTEGER,
        room_id INTEGER,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
        FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id),
        FOREIGN KEY (room_id) REFERENCES room(room_id)
    )`,

    // Renting table
    `CREATE TABLE IF NOT EXISTS renting (
        renting_id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER,
        customer_id INTEGER,
        hotel_id INTEGER,
        room_id INTEGER,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        payment_status TEXT NOT NULL,
        payment_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
        FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
        FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id),
        FOREIGN KEY (room_id) REFERENCES room(room_id)
    )`,

    // Insert initial data
    `INSERT INTO hotel_chain (name, headquarters) VALUES 
    ('Luxury Stays', 'New York')`,

    `INSERT INTO hotel (chain_id, name, address, city, country, rating) VALUES 
    (1, 'Luxury Stays Downtown', '123 Main St', 'New York', 'USA', 5)`,

    `INSERT INTO room (hotel_id, room_number, capacity, price_per_night) VALUES 
    (1, '101', 2, 200.00),
    (1, '102', 2, 200.00),
    (1, '201', 3, 300.00)`,

    `INSERT INTO employee (hotel_id, first_name, last_name, email, password, role) VALUES 
    (1, 'John', 'Manager', 'john.manager@luxurystays.com', 'password123', 'manager')`,

    `INSERT INTO customer (first_name, last_name, email, password, phone, address) VALUES 
    ('Alice', 'Smith', 'alice@example.com', 'password123', '123-456-7890', '456 Oak St'),
    ('Bob', 'Johnson', 'bob@example.com', 'password123', '098-765-4321', '789 Pine St')`,

    `INSERT INTO booking (customer_id, hotel_id, room_id, check_in_date, check_out_date, status) VALUES 
    (1, 1, 1, '2024-04-01', '2024-04-03', 'confirmed'),
    (2, 1, 2, '2024-04-01', '2024-04-03', 'confirmed')`,

    `INSERT INTO renting (booking_id, customer_id, hotel_id, room_id, check_in_date, check_out_date, payment_status) VALUES 
    (1, 1, 1, 1, '2024-04-01', '2024-04-03', 'completed')`
];

// Execute queries sequentially
function executeNextQuery(index) {
    if (index >= setupQueries.length) {
        console.log('Database setup completed successfully');
        db.close();
        return;
    }

    db.run(setupQueries[index], (err) => {
        if (err) {
            console.error(`Error executing query ${index + 1}:`, err);
            db.close();
            process.exit(1);
        }
        console.log(`Query ${index + 1} executed successfully`);
        executeNextQuery(index + 1);
    });
}

// Start executing queries
executeNextQuery(0); 