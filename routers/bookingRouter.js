const express = require('express');
const pool = require('../configs/db');
const { hasAuthority } = require('../configs/hasAuthority');
const { requireLogin } = require('../routers/auth');  // Assuming you have an authRouter with requireLogin middleware
const bookingRouter = express.Router();


// Create a new booking (with authority)
bookingRouter.post('/bookings', requireLogin, requireLogin, (req, res, next) => {
    hasAuthority('Student')(req, res, next);
}, async (req, res) => {
    try {
        const { roomId, bookingDate, bookingTime } = req.body;
        if (!roomId || !bookingDate || !bookingTime) {
            return res.status(400).send("Please provide roomId, bookingDate, and bookingTime");
        }

        // Check if the room is available for booking
        // This is a placeholder logic, you may need to adjust it based on your actual implementation
        const roomCheckQuery = `SELECT * FROM Rooms WHERE RoomID = ? AND Status = 'Free'`;
        pool.query(roomCheckQuery, [roomId], async (err, results) => {
            if (err) {
                console.error('Error checking room availability:', err);
                return res.status(500).send("An error occurred while checking room availability");
            }

            if (results.length === 0) {
                return res.status(404).send("Room not available for booking");
            }

            // Insert booking into the database
            const insertBookingQuery = `INSERT INTO Bookings (RoomID, BookingDate, BookingTime, Status, UserID) VALUES (?, ?, ?, ?, ?)`;
            pool.query(insertBookingQuery, [roomId, bookingDate, bookingTime, 'Pending', req.session.userId], (err, result) => {
                if (err) {
                    console.error('Error inserting booking:', err);
                    return res.status(500).send("An error occurred while booking the room");
                }
                console.log('Booking added successfully');

                // Optionally, you can return the booking ID
                const bookingId = result.insertId;
                res.status(200).send({ message: "Booking added successfully", bookingId });
            });
        });
    } catch (e) {
        console.error('Error adding booking:', e);
        res.status(500).send("An error occurred while booking the room");
    }
});

// Get all bookings (with authority)
bookingRouter.get('/bookings', requireLogin, requireLogin, (req, res, next) => {
    hasAuthority('Staff')(req, res, next);
}, async (req, res) => {
    try {
        // Fetch all bookings from the database
        const getBookingsQuery = `SELECT * FROM Bookings`;
        pool.query(getBookingsQuery, (err, results) => {
            if (err) {
                console.error('Error fetching bookings:', err);
                return res.status(500).send("An error occurred while fetching bookings");
            }
            console.log('Bookings fetched successfully');

            res.status(200).send(results);
        });
    } catch (e) {
        console.error('Error fetching bookings:', e);
        res.status(500).send("An error occurred while fetching bookings");
    }
});

module.exports = { bookingRouter };
