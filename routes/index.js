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
      WHERE o.UserID = ? AND o.Status != 'Completed'  -- เพิ่มเงื่อนไขเพื่อไม่ให้แสดงคำสั่งซื้อที่เสร็จสมบูรณ์
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


/* GET payment page. */
router.get('/payment', (req, res) => {
  const userId = req.session.user.userid; // ใช้ UserID จาก session ของผู้ใช้
  let totalAmount = parseFloat(req.query.totalAmount) || 0; // รับยอดรวมจาก query

  // ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
  if (!userId) {
      console.error('User is not logged in'); // แสดงข้อความข้อผิดพลาดใน console
      return res.redirect('/login'); // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ
  }

  // ดึงข้อมูล orders ของผู้ใช้จากฐานข้อมูล
  const sql = `
      SELECT o.OrderID, o.OrderDate, o.Quantity, o.UserID, o.BookID, b.BookName, b.Price, b.photo
      FROM orders o
      JOIN books b ON o.BookID = b.BookID
      WHERE o.UserID = ?`;

  connection.query(sql, [userId], (err, orders) => {
      if (err) {
          console.error('Error fetching orders:', err); // แสดงข้อความข้อผิดพลาดใน console
          return res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ'); // ส่งข้อความข้อผิดพลาดไปยังผู้ใช้
      }

      // ตรวจสอบข้อมูลคำสั่งซื้อ
      if (!Array.isArray(orders) || orders.length === 0) {
          console.warn('No orders found for user:', userId); // แสดงข้อความเตือนใน console
          return res.render('payment', { orders: [], totalAmount: 0, errorMessage: 'ไม่พบข้อมูลคำสั่งซื้อ' }); // ส่งข้อมูลคำสั่งซื้อที่ว่างเปล่า
      }

      console.log('Orders:', orders); // ตรวจสอบข้อมูลที่ดึงมาใน console

      // คำนวณยอดรวมทั้งหมดหากยังไม่ได้รับยอดรวมจาก query
      if (totalAmount === 0) {
          totalAmount = orders.reduce((acc, order) => {
              const price = parseFloat(order.Price) || 0; // ใช้ค่าที่ถูกต้องหรือ 0
              const quantity = parseInt(order.Quantity) || 0; // ใช้ค่าที่ถูกต้องหรือ 0
              return acc + price * quantity; // คำนวณยอดรวม
          }, 0);
      }

      // เก็บข้อมูล orders ใน session เพื่อใช้งานภายหลัง
      req.session.orders = orders;

      // ส่ง orders และ totalAmount ไปยัง ejs
      res.render('payment', { orders, totalAmount });
  });
});

// Route สำหรับหน้าแสดงคำสั่งซื้อที่ชำระเงินแล้ว
router.get('/completed-orders', (req, res) => {
  const userID = req.session.user ? req.session.user.userid : null;

  // ตรวจสอบว่าผู้ใช้ได้เข้าสู่ระบบหรือไม่
  if (!userID) {
      return res.render('alert', { message: 'กรุณาเข้าสู่ระบบเพื่อดูรายการคำสั่งซื้อ', messageType: 'error', redirectUrl: '/login' });
  }

  // Query ดึงข้อมูลคำสั่งซื้อที่ชำระเงินแล้วจากฐานข้อมูล
  const getCompletedOrdersQuery = `
      SELECT o.OrderID, o.OrderDate, o.Quantity, o.UserID, o.BookID, b.BookName, b.Price, b.photo
      FROM Orders o
      JOIN Books b ON o.BookID = b.BookID
      WHERE o.UserID = ? AND o.Status = 'Completed'
      ORDER BY o.OrderDate DESC`;
  
  connection.query(getCompletedOrdersQuery, [userID], (err, completedOrders) => {
      if (err) {
          console.error('Error retrieving completed orders:', err);
          return res.render('alert', { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อที่ชำระเงินแล้ว', messageType: 'error', redirectUrl: '/' });
      }

      // ส่งข้อมูลคำสั่งซื้อที่ชำระเงินไปที่ completed-orders.ejs
      res.render('completed-orders', { completedOrders });
  });
});




module.exports = router;
