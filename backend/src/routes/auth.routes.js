const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Login (for both customers and employees)
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        let table = role === 'customer' ? 'customer' : 'employee';
        let idField = role === 'customer' ? 'customer_id' : 'employee_id';
        
        // Find user
        db.get(`SELECT * FROM ${table} WHERE email = ?`, [email], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            
            // Verify password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            
            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user[idField],
                    email: user.email,
                    role,
                    ...(role === 'employee' && { position: user.position, hotel_id: user.hotel_id })
                },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );
            
            res.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user[idField],
                        email: user.email,
                        role,
                        ...(role === 'employee' && { position: user.position })
                    }
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login'
        });
    }
});

// Customer Registration
router.post('/register/customer', async (req, res) => {
    try {
        const { full_name, address, id_type, id_number, email, password, credit_card_number } = req.body;
        
        // Check if email already exists
        db.get('SELECT * FROM customer WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }
            
            if (row) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            const registrationDate = new Date().toISOString();
            
            // Insert new customer
            db.run(
                'INSERT INTO customer (full_name, address, id_type, id_number, email, password, registration_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [full_name, address, id_type, id_number, email, hashedPassword, registrationDate],
                function(err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: 'Error creating customer'
                        });
                    }
                    
                    const customerId = this.lastID;
                    
                    // Generate JWT token
                    const token = jwt.sign(
                        { 
                            id: customerId,
                            email: email,
                            role: 'customer'
                        },
                        process.env.JWT_SECRET || 'your_jwt_secret_key',
                        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
                    );
                    
                    res.status(201).json({
                        success: true,
                        data: {
                            token,
                            user: {
                                id: customerId,
                                email: email,
                                role: 'customer'
                            }
                        }
                    });
                }
            );
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during registration'
        });
    }
});

// Employee Registration (Protected - should be done by admin in real application)
router.post('/register/employee', async (req, res) => {
    try {
        const { full_name, address, ssn, position, salary, hotel_id, email, password } = req.body;
        
        // Check if email already exists
        db.get('SELECT * FROM employee WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }
            
            if (row) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Insert new employee
            db.run(
                'INSERT INTO employee (full_name, address, ssn, position, salary, hotel_id, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [full_name, address, ssn, position, salary, hotel_id, email, hashedPassword],
                function(err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: 'Error creating employee'
                        });
                    }
                    
                    const employeeId = this.lastID;
                    
                    // Generate JWT token
                    const token = jwt.sign(
                        { 
                            id: employeeId,
                            email: email,
                            role: 'employee',
                            position: position,
                            hotel_id: hotel_id
                        },
                        process.env.JWT_SECRET || 'your_jwt_secret_key',
                        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
                    );
                    
                    res.status(201).json({
                        success: true,
                        data: {
                            token,
                            user: {
                                id: employeeId,
                                email: email,
                                role: 'employee',
                                position: position
                            }
                        }
                    });
                }
            );
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during registration'
        });
    }
});

module.exports = router;
