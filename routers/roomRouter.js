const express = require('express');
const roomRouter = express.Router();
const  hasAuthority  = require('../configs/hasAuthority');
const { requireLogin } = require('../routers/auth');
const pool = require('../configs/db'); // Import the database pool

// Create a new room (with authority)
roomRouter.post('/rooms', requireLogin, (req, res, next) => {
    hasAuthority('Staff')(req, res, next);
}, async (req, res) => { // Add debugging log
    try {
        // Room creation logic here...
        const { roomName, status } = req.body;
        if (!roomName || !status) {
            return res.status(400).send("Please provide roomName and status");
        }

        // Insert room into the database
        const insertRoomQuery = `INSERT INTO Rooms (RoomName, Status) VALUES (?, ?)`;
        pool.query(insertRoomQuery, [roomName, status], (err, result) => {
            if (err) {
                console.error('Error inserting room:', err);
                return res.status(500).send("An error occurred while adding a new room");
            }
            console.log('Room added successfully');

            // Optionally, you can return the room ID
            const roomId = result.insertId;
            res.status(200).send({ message: "Room added successfully", roomId });
        });
    } catch (e) {
        console.error('Error adding room:', e);
        res.status(500).send("An error occurred while adding a new room");
    }
});

// Update an existing room (with authority)
roomRouter.put('/rooms/:roomId', requireLogin, (req, res, next) => {
    hasAuthority('Staff')(req, res, next);
}, async (req, res) => { // Add debugging log
    try {
        // Room update logic here...
        const { roomName, status } = req.body;
        const { roomId } = req.params;
        if (!roomName || !status) {
            return res.status(400).send("Please provide roomName and status");
        }

        // Update room in the database
        const updateRoomQuery = `UPDATE Rooms SET RoomName = ?, Status = ? WHERE RoomID = ?`;
        pool.query(updateRoomQuery, [roomName, status, roomId], (err, result) => {
            if (err) {
                console.error('Error updating room:', err);
                return res.status(500).send("An error occurred while updating the room");
            }
            console.log('Room updated successfully');

            res.status(200).send("Room updated successfully");
        });
    } catch (e) {
        console.error('Error updating room:', e);
        res.status(500).send("An error occurred while updating the room");
    }
});

// Delete an existing room (with authority)
roomRouter.delete('/rooms/:roomId', requireLogin, (req, res, next) => {
    hasAuthority('Staff')(req, res, next);
}, async (req, res) => { // Add debugging log
    try {
        // Room deletion logic here...
        const { roomId } = req.params;

        // Delete room from the database
        const deleteRoomQuery = `DELETE FROM Rooms WHERE RoomID = ?`;
        pool.query(deleteRoomQuery, [roomId], (err, result) => {
            if (err) {
                console.error('Error deleting room:', err);
                return res.status(500).send("An error occurred while deleting the room");
            }
            console.log('Room deleted successfully');

            res.status(200).send("Room deleted successfully");
        });
    } catch (e) {
        console.error('Error deleting room:', e);
        res.status(500).send("An error occurred while deleting the room");
    }
});

// Get all rooms (public route, no authority required)
roomRouter.get('/rooms', async (req, res) => {
    console.log('Fetching all rooms...'); // Add debugging log
    try {
        // Fetch all rooms from the database
        const getRoomsQuery = `SELECT * FROM Rooms`;
        pool.query(getRoomsQuery, (err, results) => {
            if (err) {
                console.error('Error fetching rooms:', err);
                return res.status(500).send("An error occurred while fetching rooms");
            }
            console.log('Rooms fetched successfully');

            res.status(200).send(results);
        });
    } catch (e) {
        console.error('Error fetching rooms:', e);
        res.status(500).send("An error occurred while fetching rooms");
    }
});

module.exports = roomRouter;
