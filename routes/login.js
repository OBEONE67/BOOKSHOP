var express = require('express');
var router = express.Router();
var connection = require('../connect'); // นำเข้าการเชื่อมต่อฐานข้อมูล
var bcrypt = require('bcrypt'); // นำเข้า bcrypt สำหรับการเปรียบเทียบรหัสผ่าน

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

      console.log('Found user:', user); // เพิ่มการดีบักเพื่อตรวจสอบผู้ใช้

      // Compare the hashed password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Server error. Please try again later.');
        }

        if (isMatch) {
          // Password matched, set user session
          req.session.user = {
            userid: user.userid, // เก็บ UserID
            username: user.username,
            role: user.type === 'admin' ? 'admin' : 'customer' // ตรวจสอบประเภทผู้ใช้ (admin หรือ customer)
          };

          console.log('User session set:', req.session.user); // ตรวจสอบข้อมูลเซสชัน

          // Query to get books for all users
          var sql2 = 'SELECT * FROM books';
          connection.query(sql2, (err, books) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Error retrieving books.');
            }

            req.session.books = books;

            // Query to get user's cart items after successful login
            var sql3 = `
              SELECT books.BookID, books.BookName, books.Price, books.photo, Cart.Quantity 
              FROM Cart 
              JOIN books ON Cart.BookID = books.BookID 
              WHERE Cart.UserID = ?`;
            
            connection.query(sql3, [user.userid], (err, cartItems) => {
              if (err) {
                console.error(err);
                return res.status(500).send('Error retrieving cart items.');
              }

              req.session.cart = cartItems; // เก็บข้อมูลตะกร้าใน session

              // Redirect based on user role
              if (req.session.user.role === 'admin') {
                res.render('useradmin', { 
                  books: req.session.books, 
                });
              } else if (req.session.user.role === 'customer') {
                res.render('', { // เปลี่ยนให้เป็นชื่อไฟล์ EJS สำหรับลูกค้า
                  books: req.session.books, 
                  cartItems: req.session.cart, // ส่งข้อมูลตะกร้าไปด้วย
                  user: req.session.user // ส่งข้อมูล user ไปด้วย
                });
              } else {
                res.status(403).send('Access denied.');
              }
            });
          });
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
