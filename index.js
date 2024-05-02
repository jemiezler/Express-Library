const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const pool = require('./configs/db'); // Import the database pool
const {authRouter, requireLogin} = require('./routers/auth'); // Assuming you have an authRouter
const roomRouter = require('./routers/roomRouter'); // Assuming you have a roomRouter
const {bookingRouter} = require('./routers/bookingRouter');

const app = express();

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});


app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/views/signup.html');
});

app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/views/admin.html');
});

app.get('/student', (req, res) => {
    res.sendFile(__dirname + '/views/student.html');
});

app.get('/lecturer', (req, res) => {
    res.sendFile(__dirname + '/views/lecturer.html');
});


// Middleware setup
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger('dev'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));


//Mount related router.
app.use('/auth',authRouter);
app.use('/rooms', roomRouter);
app.use('/bookings', bookingRouter);

pool.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
    if (error) {
        console.error('Error connecting to the database:', error);
    } else {
        console.log('Connected to the database successfully');
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});