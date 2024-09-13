var express = require('express');
var router = express.Router();
var connection = require('../connect'); // Import the database connection
var bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// Register Route
router.post('/', async (req, res) => {
    // Destructure the fields from the request body
    var { firstname, lastname, username, email, password, address, phone } = req.body;

    // Validate that all fields are present
    if (!firstname || !lastname || !username || !email || !password || !address || !phone) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // SQL query to insert a new user
        var sql = 'INSERT INTO users (firstname, lastname, username, email, password, address, phone) VALUES (?, ?, ?, ?, ?, ?, ?)';
        var values = [firstname, lastname, username, email, hashedPassword, address, phone];

        // Execute the query
        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send('Username or email already exists.');
                }
                return res.status(500).send('Server error. Please try again later.');
            }
            res.send(`
                <html>
                    <head>
                        <title>Registration Success</title>
                        <script>
                            setTimeout(function() {
                                window.location.href = '/login';
                            }, 3000); // Redirect after 3 seconds
                        </script>
                    </head>
                    <body>
                        <h1>Registration Successful!</h1>
                        <p>You will be redirected to the login page shortly...</p>
                    </body>
                </html>
            `);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error. Please try again later.');
    }
});

module.exports = router;
