const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeEmployee } = require('../middleware/auth.middleware');

// Get all rentings (for employees)
router.get('/', authenticateToken, authorizeEmployee, (req, res) => {
    db.all(
        `SELECT r.*, c.full_name as customer_name, h.name as hotel_name, 
                rm.room_number, e.full_name as employee_name
         FROM renting r
         JOIN customer c ON r.customer_id = c.customer_id
         JOIN hotel h ON r.hotel_id = h.hotel_id
         JOIN room rm ON r.room_id = rm.room_id
         JOIN employee e ON r.employee_id = e.employee_id
         ORDER BY r.created_at DESC`,
        (err, rentings) => {
            if (err) {
                console.error('Error fetching rentings:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching rentings'
                });
            }
            res.json({
                success: true,
                data: rentings
            });
        }
    );
});

// Create a new renting
router.post('/', authenticateToken, authorizeEmployee, (req, res) => {
    const {
        customer_id,
        hotel_id,
        room_id,
        start_date,
        end_date,
        payment_status,
        payment_amount,
        booking_id
    } = req.body;
    
    const employee_id = req.user.id;
    const created_at = new Date().toISOString();

    db.run(
        `INSERT INTO renting (
            customer_id, hotel_id, room_id, employee_id,
            start_date, end_date, payment_status, payment_amount,
            booking_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            customer_id, hotel_id, room_id, employee_id,
            start_date, end_date, payment_status, payment_amount,
            booking_id, created_at
        ],
        function(err) {
            if (err) {
                console.error('Error creating renting:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error creating renting'
                });
            }

            res.status(201).json({
                success: true,
                data: {
                    renting_id: this.lastID,
                    customer_id,
                    hotel_id,
                    room_id,
                    employee_id,
                    start_date,
                    end_date,
                    payment_status,
                    payment_amount,
                    booking_id,
                    created_at
                }
            });
        }
    );
});

// Update renting payment status
router.patch('/:id/payment', authenticateToken, authorizeEmployee, (req, res) => {
    const { payment_status, payment_date } = req.body;
    const rentingId = req.params.id;

    db.run(
        'UPDATE renting SET payment_status = ?, payment_date = ? WHERE renting_id = ?',
        [payment_status, payment_date, rentingId],
        function(err) {
            if (err) {
                console.error('Error updating renting payment:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating renting payment'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Renting not found'
                });
            }

            res.json({
                success: true,
                message: 'Renting payment updated successfully'
            });
        }
    );
});

// Get renting details
router.get('/:id', authenticateToken, authorizeEmployee, (req, res) => {
    const rentingId = req.params.id;
    
    db.get(
        `SELECT r.*, c.full_name as customer_name, h.name as hotel_name,
                rm.room_number, e.full_name as employee_name
         FROM renting r
         JOIN customer c ON r.customer_id = c.customer_id
         JOIN hotel h ON r.hotel_id = h.hotel_id
         JOIN room rm ON r.room_id = rm.room_id
         JOIN employee e ON r.employee_id = e.employee_id
         WHERE r.renting_id = ?`,
        [rentingId],
        (err, renting) => {
            if (err) {
                console.error('Error fetching renting:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching renting'
                });
            }

            if (!renting) {
                return res.status(404).json({
                    success: false,
                    message: 'Renting not found'
                });
            }

            res.json({
                success: true,
                data: renting
            });
        }
    );
});

module.exports = router;
