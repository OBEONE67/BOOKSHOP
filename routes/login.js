var express = require('express');
var router = express.Router();
var connection = require('../connect'); // Import the database connection

// Handle login POST request
router.post('/', (req, res) => {
  var { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  // Query to find the user by email and password
  var sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  connection.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error. Please try again later.');
    }

    if (results.length > 0) {
      // Save user information in session
      var user = results[0];
      req.session.user = {
        username: user.username,
        role: user.username === 'admin' ? 'admin' : 'user' // Set role based on username
      };

      // Redirect based on user role
      if (req.session.user.role === 'admin') {
        res.redirect('/useradmin');
      } else {
        res.redirect('/');
      }
    } else {
      res.status(401).send('Invalid email or password.');
    }
  });
});

module.exports = router;
