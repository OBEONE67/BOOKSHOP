var express = require('express');
var router = express.Router();
var connection = require('../connect'); // Import the database connection
var bcrypt = require('bcrypt'); // Import bcrypt for password comparison

// Handle login POST request
router.post('/', (req, res) => {
  var { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  // Query to find the user by email
  var sql = 'SELECT * FROM users WHERE email = ?';
  connection.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error. Please try again later.');
    }

    // Check if user is found
    if (results.length > 0) {
      var user = results[0];

      // Compare the hashed password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Server error. Please try again later.');
        }

        if (isMatch) {
          // Password matched, set user session
          req.session.user = {
            username: user.username,
            role: user.username === 'admin' ? 'admin' : 'user' // Example role check; customize as needed
          };

          // Redirect based on user role
          if (req.session.user.role === 'admin') {
            var sql2 = 'SELECT * FROM books';
            connection.query(sql2, (err, result) => {
            if (err) {
              console.error(err);
            } else {
              req.session.books = result;
              res.render('useradmin', { books: req.session.books });
            }
          });
          } else {
            var sql2 = 'SELECT * FROM books';
            connection.query(sql2, (err, result) => {
            if (err) {
              console.error(err);
            } else {
              req.session.books = result;
              res.render('', { books: req.session.books });
            }
          });
          }
        } else {
          // Password did not match
          res.status(401).send('Invalid email or password.');
        }
      });
    } else {
      // User not found
      res.status(401).send('Invalid email or password.');
    }
  });
});

module.exports = router;
