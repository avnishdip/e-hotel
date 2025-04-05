const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Search available rooms
router.get('/search', (req, res) => {
    const {
        start_date,
        end_date,
        capacity,
        area,
        chain_id,
        hotel_category,
        min_price,
        max_price,
        view_type
    } = req.query;

    let sql = `
        SELECT r.*, h.name as hotel_name, h.address as hotel_address, 
               h.category as hotel_category, hc.name as chain_name
        FROM room r
        JOIN hotel h ON r.hotel_id = h.hotel_id
        JOIN hotel_chain hc ON h.chain_id = hc.chain_id
        WHERE 1=1
    `;
    const params = [];

    // Add date range filter if dates are provided
    if (start_date && end_date) {
        sql += `
            AND r.room_id NOT IN (
                SELECT room_id FROM booking 
                WHERE booking_status != 'cancelled'
                AND (
                    (start_date <= ? AND end_date >= ?)
                    OR (start_date <= ? AND end_date >= ?)
                    OR (start_date >= ? AND end_date <= ?)
                )
            )
            AND r.room_id NOT IN (
                SELECT room_id FROM renting
                WHERE (
                    (start_date <= ? AND end_date >= ?)
                    OR (start_date <= ? AND end_date >= ?)
                    OR (start_date >= ? AND end_date <= ?)
                )
            )
        `;
        params.push(
            end_date, start_date,
            start_date, start_date,
            start_date, end_date,
            end_date, start_date,
            start_date, start_date,
            start_date, end_date
        );
    }

    if (capacity) {
        sql += ' AND r.capacity >= ?';
        params.push(capacity);
    }

    if (area) {
        sql += ' AND h.address LIKE ?';
        params.push(`%${area}%`);
    }

    if (chain_id) {
        sql += ' AND h.chain_id = ?';
        params.push(chain_id);
    }

    if (hotel_category) {
        sql += ' AND h.category = ?';
        params.push(hotel_category);
    }

    if (min_price) {
        sql += ' AND r.price >= ?';
        params.push(min_price);
    }

    if (max_price) {
        sql += ' AND r.price <= ?';
        params.push(max_price);
    }

    if (view_type) {
        sql += ' AND r.view_type = ?';
        params.push(view_type);
    }

    sql += ' ORDER BY r.price';

    db.all(sql, params, (err, rooms) => {
        if (err) {
            console.error('Error searching rooms:', err);
            return res.status(500).json({
                success: false,
                message: 'Error searching rooms'
            });
        }
        res.json({
            success: true,
            data: rooms
        });
    });
});

// Get room details
router.get('/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    db.get(
        `SELECT r.*, h.name as hotel_name, h.address as hotel_address 
         FROM room r
         JOIN hotel h ON r.hotel_id = h.hotel_id
         WHERE r.room_id = ?`,
        [roomId],
        (err, room) => {
            if (err) {
                console.error('Error fetching room:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching room'
                });
            }
            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: 'Room not found'
                });
            }
            res.json({
                success: true,
                data: room
            });
        }
    );
});

// Get rooms by hotel
router.get('/hotel/:hotelId', (req, res) => {
    const hotelId = req.params.hotelId;
    db.all(
        'SELECT * FROM room WHERE hotel_id = ? ORDER BY room_number',
        [hotelId],
        (err, rooms) => {
            if (err) {
                console.error('Error fetching rooms:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching rooms'
                });
            }
            res.json({
                success: true,
                data: rooms
            });
        }
    );
});

module.exports = router;
