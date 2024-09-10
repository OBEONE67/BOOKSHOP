var express = require('express');
var router = express.Router();
var connection = require('../connect'); // Import the database connection

// Register Route
router.post('/', (req, res) => {
    var { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('All fields are required.');
    }

    var sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    connection.query(sql, [username, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error. Please try again later.');
        }
        res.send('User registered successfully!');
    });
});

module.exports = router;
