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


/* GET UserAdmin page. */
router.get('/books/editbook.ejs', function(req, res, next) {
  res.render('editbook', { title: 'editbook' });
});






module.exports = router;
