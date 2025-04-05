const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeEmployee } = require('../middleware/auth.middleware');

// Get rentings by hotel ID
router.get('/hotel/:hotelId', authenticateToken, authorizeEmployee, (req, res) => {
    const hotelId = req.params.hotelId;
    
    db.all(
        `SELECT r.*, c.full_name as customer_name, rm.room_number
         FROM renting r
         JOIN customer c ON r.customer_id = c.customer_id
         JOIN room rm ON r.room_id = rm.room_id
         WHERE r.hotel_id = ?
         ORDER BY r.created_at DESC`,
        [hotelId],
        (err, rentings) => {
            if (err) {
                console.error('Error fetching hotel rentings:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching hotel rentings'
                });
            }
            res.json({
                success: true,
                data: rentings
            });
        }
    );
});

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

// Process payment for a renting
router.put('/:id/payment', authenticateToken, authorizeEmployee, (req, res) => {
    const rentingId = req.params.id;
    const employeeId = req.user.id;

    db.run(
        `UPDATE renting 
         SET payment_status = 'completed', 
             payment_date = datetime('now')
         WHERE renting_id = ? AND employee_id = ?`,
        [rentingId, employeeId],
        function(err) {
            if (err) {
                console.error('Error processing payment:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error processing payment'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Renting not found or unauthorized'
                });
            }

            res.json({
                success: true,
                message: 'Payment processed successfully'
            });
        }
    );
});

// Create a new renting from a booking
router.post('/booking/:bookingId', authenticateToken, authorizeEmployee, (req, res) => {
    const bookingId = req.params.bookingId;
    const employeeId = req.user.id;
    const { payment_amount } = req.body;

    // Start a transaction
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Get booking details
        db.get(
            `SELECT * FROM booking WHERE booking_id = ?`,
            [bookingId],
            (err, booking) => {
                if (err) {
                    db.run('ROLLBACK');
                    console.error('Error fetching booking:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error creating renting'
                    });
                }

                if (!booking) {
                    db.run('ROLLBACK');
                    return res.status(404).json({
                        success: false,
                        message: 'Booking not found'
                    });
                }

                // Create renting
                db.run(
                    `INSERT INTO renting (
                        customer_id, hotel_id, room_id, employee_id,
                        start_date, end_date, payment_status, payment_amount,
                        booking_id, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
                    [
                        booking.customer_id,
                        booking.hotel_id,
                        booking.room_id,
                        employeeId,
                        booking.start_date,
                        booking.end_date,
                        'pending',
                        payment_amount,
                        bookingId
                    ],
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            console.error('Error creating renting:', err);
                            return res.status(500).json({
                                success: false,
                                message: 'Error creating renting'
                            });
                        }

                        // Update booking status
                        db.run(
                            `UPDATE booking 
                             SET booking_status = 'checked_in' 
                             WHERE booking_id = ?`,
                            [bookingId],
                            (err) => {
                                if (err) {
                                    db.run('ROLLBACK');
                                    console.error('Error updating booking:', err);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Error creating renting'
                                    });
                                }

                                db.run('COMMIT');
                                res.status(201).json({
                                    success: true,
                                    data: {
                                        renting_id: this.lastID,
                                        message: 'Renting created successfully'
                                    }
                                });
                            }
                        );
                    }
                );
            }
        );
    });
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
