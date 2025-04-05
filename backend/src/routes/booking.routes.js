const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeCustomer, authorizeEmployee } = require('../middleware/auth.middleware');

// Get customer's bookings
router.get('/customer', authenticateToken, authorizeCustomer, (req, res) => {
    const customerId = req.user.id;
    db.all(
        `SELECT b.*, h.name as hotel_name, r.room_number, r.price
         FROM booking b
         JOIN hotel h ON b.hotel_id = h.hotel_id
         JOIN room r ON b.room_id = r.room_id
         WHERE b.customer_id = ?
         ORDER BY b.created_at DESC`,
        [customerId],
        (err, bookings) => {
            if (err) {
                console.error('Error fetching bookings:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching bookings'
                });
            }
            res.json({
                success: true,
                data: bookings
            });
        }
    );
});

// Create a new booking
router.post('/', authenticateToken, authorizeCustomer, (req, res) => {
    const { hotel_id, room_id, start_date, end_date } = req.body;
    const customer_id = req.user.id;
    const booking_status = 'pending';
    const created_at = new Date().toISOString();

    db.run(
        'INSERT INTO booking (customer_id, hotel_id, room_id, start_date, end_date, booking_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [customer_id, hotel_id, room_id, start_date, end_date, booking_status, created_at],
        function(err) {
            if (err) {
                console.error('Error creating booking:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error creating booking'
                });
            }

            res.status(201).json({
                success: true,
                data: {
                    booking_id: this.lastID,
                    customer_id,
                    hotel_id,
                    room_id,
                    start_date,
                    end_date,
                    booking_status,
                    created_at
                }
            });
        }
    );
});

// Update booking status
router.patch('/:id', authenticateToken, authorizeEmployee, (req, res) => {
    const { status } = req.body;
    const bookingId = req.params.id;

    db.run(
        'UPDATE booking SET booking_status = ? WHERE booking_id = ?',
        [status, bookingId],
        function(err) {
            if (err) {
                console.error('Error updating booking:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating booking'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            res.json({
                success: true,
                message: 'Booking updated successfully'
            });
        }
    );
});

// Get all bookings (for employees)
router.get('/', authenticateToken, authorizeEmployee, (req, res) => {
    db.all(
        `SELECT b.*, c.full_name as customer_name, h.name as hotel_name, r.room_number
         FROM booking b
         JOIN customer c ON b.customer_id = c.customer_id
         JOIN hotel h ON b.hotel_id = h.hotel_id
         JOIN room r ON b.room_id = r.room_id
         ORDER BY b.created_at DESC`,
        (err, bookings) => {
            if (err) {
                console.error('Error fetching bookings:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching bookings'
                });
            }
            res.json({
                success: true,
                data: bookings
            });
        }
    );
});

module.exports = router;
