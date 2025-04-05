-- Views for e-Hotels system

-- View 1: Number of available rooms per area
CREATE VIEW IF NOT EXISTS available_rooms_per_area AS
WITH booked_rooms AS (
    SELECT r.room_id, h.address
    FROM room r
    JOIN hotel h ON r.hotel_id = h.hotel_id
    JOIN booking b ON r.room_id = b.room_id
    WHERE b.booking_status NOT IN ('cancelled', 'completed')
    AND date('now') BETWEEN b.start_date AND b.end_date
    UNION
    SELECT r.room_id, h.address
    FROM room r
    JOIN hotel h ON r.hotel_id = h.hotel_id
    JOIN renting rt ON r.room_id = rt.room_id
    WHERE date('now') BETWEEN rt.start_date AND rt.end_date
)
SELECT 
    h.address as area,
    COUNT(r.room_id) as available_rooms
FROM hotel h
JOIN room r ON h.hotel_id = r.hotel_id
LEFT JOIN booked_rooms br ON r.room_id = br.room_id
WHERE br.room_id IS NULL
GROUP BY h.address;

-- View 2: Hotel room capacity and statistics
CREATE VIEW IF NOT EXISTS hotel_room_capacity AS
SELECT 
    h.hotel_id,
    h.name as hotel_name,
    hc.name as chain_name,
    h.category as star_rating,
    COUNT(r.room_id) as total_rooms,
    SUM(r.capacity) as total_capacity,
    ROUND(AVG(r.price), 2) as avg_room_price
FROM hotel h
JOIN hotel_chain hc ON h.chain_id = hc.chain_id
JOIN room r ON h.hotel_id = r.hotel_id
GROUP BY h.hotel_id, h.name, hc.name, h.category;

-- View 3: Room availability status
CREATE VIEW IF NOT EXISTS room_availability AS
SELECT 
    r.room_id,
    h.hotel_id,
    h.name as hotel_name,
    hc.name as chain_name,
    r.room_number,
    r.price,
    r.capacity,
    r.view_type,
    r.amenities,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM booking b 
            WHERE b.room_id = r.room_id 
            AND b.booking_status NOT IN ('cancelled', 'completed')
            AND date('now') BETWEEN b.start_date AND b.end_date
        ) AND NOT EXISTS (
            SELECT 1 FROM renting rt 
            WHERE rt.room_id = r.room_id 
            AND date('now') BETWEEN rt.start_date AND rt.end_date
        ) THEN 'available'
        ELSE 'occupied'
    END as status
FROM room r
JOIN hotel h ON r.hotel_id = h.hotel_id
JOIN hotel_chain hc ON h.chain_id = hc.chain_id;

-- View 4: Hotel Statistics
CREATE VIEW IF NOT EXISTS hotel_statistics AS
SELECT 
    h.hotel_id,
    h.name as hotel_name,
    COUNT(DISTINCT r.room_id) as total_rooms,
    COUNT(DISTINCT CASE 
        WHEN b.booking_status = 'confirmed' THEN b.booking_id 
        END) as active_bookings,
    COUNT(DISTINCT CASE 
        WHEN rt.payment_status = 'pending' THEN rt.renting_id 
        END) as pending_payments,
    COALESCE(SUM(CASE 
        WHEN rt.payment_status = 'completed' 
        THEN rt.payment_amount 
        END), 0) as total_revenue
FROM hotel h
LEFT JOIN room r ON h.hotel_id = r.hotel_id
LEFT JOIN booking b ON h.hotel_id = b.hotel_id
LEFT JOIN renting rt ON h.hotel_id = rt.hotel_id
GROUP BY h.hotel_id, h.name;

-- View 5: Employee Performance
CREATE VIEW IF NOT EXISTS employee_performance AS
SELECT 
    e.employee_id,
    e.full_name,
    e.position,
    h.name as hotel_name,
    COUNT(DISTINCT r.renting_id) as total_rentings,
    COUNT(DISTINCT CASE 
        WHEN r.payment_status = 'completed' 
        THEN r.renting_id 
        END) as completed_payments,
    COALESCE(SUM(CASE 
        WHEN r.payment_status = 'completed' 
        THEN r.payment_amount 
        END), 0) as total_processed_amount
FROM employee e
JOIN hotel h ON e.hotel_id = h.hotel_id
LEFT JOIN renting r ON e.employee_id = r.employee_id
GROUP BY e.employee_id, e.full_name, e.position, h.name;
