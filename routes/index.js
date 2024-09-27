var express = require('express');
var router = express.Router();
var connection = require('../connect');

/* GET home page. */
// Route สำหรับแสดงรายการหนังสือทั้งหมด
router.get('/', (req, res) => {
  var sql = "SELECT * FROM books";

  connection.query(sql, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).send("Server error");
      }
      
      // ส่งข้อมูลหนังสือไปยัง view EJS แม้ผู้ใช้จะไม่ได้ล็อกอิน
      res.render('index', { books: results });
  });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'login' });
});

/* GET BOOKTYPE1 page. */
router.get('/BOOKTYPE1', function(req, res, next) {
  res.render('BOOKTYPE1', { title: 'Express' });
});

/* GET register page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'register' });
});

/* GET User page. */
router.get('/user', function(req, res, next) {
  res.render('user', { title: 'user' });
});

/* GET User page. */
router.get('/useradmin', function(req, res, next) {
  res.render('useradmin', { title: 'useradmin' });
});

/* GET UserAdmin page. */
router.get('/useradmin', function(req, res, next) {
  res.render('useradmin', { title: 'useradmin' });
});


/* GET editbook page. */
router.get('/books/editbook.ejs', function(req, res, next) {
  res.render('editbook', { title: 'editbook' });
});

/* GET cart page. */
router.get('/cart', function(req, res, next) {
  res.render('cart', { title: 'cart' });
});

/* GET orders page. */
// Route สำหรับหน้า orders
router.get('/orders', (req, res) => {
  const userID = req.session.user ? req.session.user.userid : null;

  // ตรวจสอบว่าผู้ใช้ได้เข้าสู่ระบบหรือไม่
  if (!userID) {
      return res.render('alert', { message: 'กรุณาเข้าสู่ระบบเพื่อดูรายการคำสั่งซื้อ', messageType: 'error', redirectUrl: '/login' });
  }

  // Query ดึงข้อมูลคำสั่งซื้อจากฐานข้อมูล พร้อมชื่อหนังสือ ราคา และรูปภาพ
  const getOrderQuery = `
      SELECT o.OrderID, o.OrderDate, o.Quantity, o.UserID, o.BookID, b.BookName, b.Price, b.photo
      FROM Orders o
      JOIN Books b ON o.BookID = b.BookID
      WHERE o.UserID = ?
      ORDER BY o.OrderDate DESC`;
  
  connection.query(getOrderQuery, [userID], (err, orders) => {
      if (err) {
          console.error('Error retrieving orders:', err);
          return res.render('alert', { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ', messageType: 'error', redirectUrl: '/' });
      }

      // ส่งข้อมูลคำสั่งซื้อไปที่ orders.ejs
      res.render('orders', { orders });
  });
});

/* GET cart page. */
router.get('/payment', function(req, res, next) {
  res.render('payment', { title: 'payment' });
});





module.exports = router;
