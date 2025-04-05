-- Database schema for e-Hotels system

-- Hotel Chain table
CREATE TABLE IF NOT EXISTS hotel_chain (
    chain_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    central_office_address TEXT NOT NULL,
    number_hotels INTEGER NOT NULL CHECK (number_hotels >= 0),
    contact_emails TEXT NOT NULL, -- JSON string
    phone_numbers TEXT NOT NULL  -- JSON string
);

-- Hotel table
CREATE TABLE IF NOT EXISTS hotel (
    hotel_id INTEGER PRIMARY KEY AUTOINCREMENT,
    chain_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    category INTEGER CHECK (category BETWEEN 1 AND 5),
    contact_emails TEXT NOT NULL, -- JSON string
    phone_numbers TEXT NOT NULL, -- JSON string
    FOREIGN KEY (chain_id) REFERENCES hotel_chain(chain_id) ON DELETE CASCADE
);

-- Room table
CREATE TABLE IF NOT EXISTS room (
    room_id INTEGER PRIMARY KEY AUTOINCREMENT,
    hotel_id INTEGER NOT NULL,
    room_number TEXT NOT NULL,
    price REAL NOT NULL CHECK (price > 0),
    amenities TEXT NOT NULL, -- JSON string
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    view_type TEXT CHECK (view_type IN ('sea', 'mountain', 'city', 'garden')),
    extendable INTEGER DEFAULT 0, -- Boolean: 0 or 1
    damage_status TEXT,
    UNIQUE (hotel_id, room_number),
    FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id) ON DELETE CASCADE
);

-- Customer table
CREATE TABLE IF NOT EXISTS customer (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    address TEXT NOT NULL,
    id_type TEXT CHECK (id_type IN ('SSN', 'SIN', 'driving_license')),
    id_number TEXT NOT NULL,
    registration_date TEXT NOT NULL DEFAULT (date('now')),
    credit_card_number TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- Employee table
CREATE TABLE IF NOT EXISTS employee (
    employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    address TEXT NOT NULL,
    ssn TEXT NOT NULL UNIQUE,
    position TEXT NOT NULL,
    salary REAL CHECK (salary > 0),
    hotel_id INTEGER NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id) ON DELETE CASCADE
);

-- Booking table
CREATE TABLE IF NOT EXISTS booking (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    hotel_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    booking_status TEXT NOT NULL CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id),
    FOREIGN KEY (room_id) REFERENCES room(room_id),
    CHECK (end_date > start_date)
);

-- Renting table
CREATE TABLE IF NOT EXISTS renting (
    renting_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    hotel_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'completed')),
    payment_amount REAL NOT NULL CHECK (payment_amount > 0),
    payment_date TEXT,
    booking_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id),
    FOREIGN KEY (room_id) REFERENCES room(room_id),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id),
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
    CHECK (end_date > start_date)
);

-- Archive table
CREATE TABLE IF NOT EXISTS archive (
    archive_id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_type TEXT NOT NULL CHECK (record_type IN ('BOOKING', 'RENTING')),
    original_record_id INTEGER NOT NULL,
    archive_date TEXT NOT NULL DEFAULT (datetime('now')),
    additional_details TEXT, -- JSON string
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_room_search ON room(price, capacity);
CREATE INDEX IF NOT EXISTS idx_hotel_search ON hotel(category, address);
CREATE INDEX IF NOT EXISTS idx_booking_dates ON booking(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_renting_dates ON renting(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_customer_search ON customer(full_name, email);
