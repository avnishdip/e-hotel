const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeEmployee } = require('../middleware/auth.middleware');

// Get room capacity statistics
router.get('/room-capacity', authenticateToken, authorizeEmployee, (req, res) => {
    const query = `
        SELECT 
            h.name as hotel_name,
            hc.name as chain_name,
            h.category as star_rating,
            COUNT(r.room_id) as total_rooms,
            SUM(r.capacity) as total_capacity,
            ROUND(AVG(r.price), 2) as avg_room_price
        FROM hotel h
        JOIN hotel_chain hc ON h.chain_id = hc.chain_id
        JOIN room r ON h.hotel_id = r.hotel_id
        GROUP BY h.hotel_id, h.name, hc.name, h.category
        ORDER BY h.name
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching room capacity:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching room capacity statistics'
            });
        }
        res.json({
            success: true,
            data: rows
        });
    });
});

// Get employee performance statistics
router.get('/employee-performance', authenticateToken, authorizeEmployee, (req, res) => {
    const query = `
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
        GROUP BY e.employee_id, e.full_name, e.position, h.name
        ORDER BY total_processed_amount DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching employee performance:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching employee performance statistics'
            });
        }
        res.json({
            success: true,
            data: rows
        });
    });
});

// Get hotel statistics
router.get('/hotel-statistics', authenticateToken, authorizeEmployee, (req, res) => {
    const query = `
        SELECT 
            h.name as hotel_name,
            COUNT(DISTINCT r.room_id) as total_rooms,
            COUNT(DISTINCT CASE 
                WHEN b.booking_status = 'confirmed' 
                THEN b.booking_id 
                END) as active_bookings,
            COUNT(DISTINCT CASE 
                WHEN rt.payment_status = 'pending' 
                THEN rt.renting_id 
                END) as pending_payments,
            COALESCE(SUM(CASE 
                WHEN rt.payment_status = 'completed' 
                THEN rt.payment_amount 
                END), 0) as total_revenue
        FROM hotel h
        LEFT JOIN room r ON h.hotel_id = r.hotel_id
        LEFT JOIN booking b ON h.hotel_id = b.hotel_id
        LEFT JOIN renting rt ON h.hotel_id = rt.hotel_id
        GROUP BY h.hotel_id, h.name
        ORDER BY total_revenue DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching hotel statistics:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching hotel statistics'
            });
        }
        res.json({
            success: true,
            data: rows
        });
    });
});

module.exports = router;
