const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all hotel chains
router.get('/chains', (req, res) => {
    db.all(
        'SELECT * FROM hotel_chain ORDER BY name',
        (err, chains) => {
            if (err) {
                console.error('Error fetching hotel chains:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching hotel chains'
                });
            }
            res.json({
                success: true,
                data: chains
            });
        }
    );
});

// Get hotels by chain
router.get('/chain/:chainId', (req, res) => {
    const chainId = req.params.chainId;
    db.all(
        'SELECT * FROM hotel WHERE chain_id = ? ORDER BY name',
        [chainId],
        (err, hotels) => {
            if (err) {
                console.error('Error fetching hotels:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching hotels'
                });
            }
            res.json({
                success: true,
                data: hotels
            });
        }
    );
});

// Get hotel details
router.get('/:hotelId', (req, res) => {
    const hotelId = req.params.hotelId;
    db.get(
        `SELECT h.*, hc.name as chain_name 
         FROM hotel h
         JOIN hotel_chain hc ON h.chain_id = hc.chain_id
         WHERE h.hotel_id = ?`,
        [hotelId],
        (err, hotel) => {
            if (err) {
                console.error('Error fetching hotel:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching hotel'
                });
            }
            if (!hotel) {
                return res.status(404).json({
                    success: false,
                    message: 'Hotel not found'
                });
            }
            res.json({
                success: true,
                data: hotel
            });
        }
    );
});

// Search hotels
router.get('/search', (req, res) => {
    const { area, category, chain_id } = req.query;
    let sql = 'SELECT h.*, hc.name as chain_name FROM hotel h JOIN hotel_chain hc ON h.chain_id = hc.chain_id WHERE 1=1';
    const params = [];

    if (area) {
        sql += ' AND h.address LIKE ?';
        params.push(`%${area}%`);
    }
    if (category) {
        sql += ' AND h.category = ?';
        params.push(category);
    }
    if (chain_id) {
        sql += ' AND h.chain_id = ?';
        params.push(chain_id);
    }

    sql += ' ORDER BY h.name';

    db.all(sql, params, (err, hotels) => {
        if (err) {
            console.error('Error searching hotels:', err);
            return res.status(500).json({
                success: false,
                message: 'Error searching hotels'
            });
        }
        res.json({
            success: true,
            data: hotels
        });
    });
});

module.exports = router;
