const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const pool = require('../configs/db');
const { hasAuthority } = require('../configs/hasAuthority');

const authRouter = express.Router();

// Session configuration
authRouter.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
    if (req.session.username) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

// Logout route
authRouter.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("An error occurred while logging out");
        }
        res.redirect('/');
    });
});

authRouter.post('/register', async (req, res) => {
    try {
        const { userId, name, username, password, role } = req.body;
        // Add validation checks for input data
        if (!userId || !name || !username || !password || !role) {
            return res.status(400).send("Please provide all required fields");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const insertUserQuery = `INSERT INTO Users (UserID, Name, Username, Password, Role) VALUES (?, ?, ?, ?, ?)`;
        pool.query(insertUserQuery, [userId, name, username, hashedPassword, role], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).send("An error occurred during registration");
            }
            console.log('User registered successfully');
        
            // Optionally, you can return the user ID
            const userId = result.insertId;
            res.status(200).send({ message: "User registered successfully", userId });
        });
        
        
    } catch (e) {
        console.error('Error during register:', e);
        res.status(500).send("An error occurred during registration");
    }
});

authRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Add validation checks for input data
        if (!username || !password) {
            return res.status(400).send("Please provide username and password");
        }

        // Check if the user exists in the database
        const getUserQuery = `SELECT * FROM Users WHERE Username = ?`;
        pool.query(getUserQuery, [username], async (err, results) => {
            if (err) {
                console.error('Error retrieving user:', err);
                return res.status(500).send("An error occurred during login");
            }

            if (results.length === 0) {
                return res.status(404).send("User not found");
            }

            const user = results[0];

            // Verify password
            const passwordMatch = await bcrypt.compare(password, user.Password);
            if (!passwordMatch) {
                return res.status(401).send("Incorrect password");
            }
            
            // Password is correct, create a session or token for authentication
            // Store necessary user data in session
            req.session.userId = user.UserID;
            req.session.username = user.Username;
            req.session.role = user.Role;
            res.status(200).json({
                userId: req.session.userId,
                username: req.session.username,
                role: req.session.role,
                message: "Login successful"
            });

            console.log('User Role:', req.session.role);


        });
    } catch (e) {
        console.error('Error during login:', e);
        res.status(500).send("An error occurred during login");
    }
});

// Export the router
module.exports = { authRouter, requireLogin };
