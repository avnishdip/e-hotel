const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// getting all the route files
const authRoutes = require('./routes/auth.routes');
const hotelRoutes = require('./routes/hotel.routes');
const roomRoutes = require('./routes/room.routes');
const bookingRoutes = require('./routes/booking.routes');
const rentingRoutes = require('./routes/renting.routes');
const reportsRoutes = require('./routes/reports.routes');

const app = express();

// setting up some basic stuff
app.use(helmet()); // makes the app more secure
app.use(cors()); // lets frontend talk to backend
app.use(morgan('dev')); // shows what people are doing
app.use(express.json()); // reads json data
app.use(express.urlencoded({ extended: true })); // reads form data

// connecting all the routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rentings', rentingRoutes);
app.use('/api/reports', reportsRoutes);

// if something goes wrong, this will handle it
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
