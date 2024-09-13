var express = require('express');
var router = express.Router();
var db = require('../connect'); // ใช้ตัวแปร connection เป็น db

// Route สำหรับแสดงหน้า UserAdmin
router.get('/', (req, res) => {
    const query = 'SELECT * FROM books';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err); // แสดงข้อผิดพลาดในคอนโซล
            return res.status(500).send('Server Error');
        }
        res.render('useradmin', { books: results }); // ตรวจสอบชื่อไฟล์และตัวแปร
    });
});

// Route สำหรับเพิ่มหนังสือใหม่
router.post('/', (req, res) => {
    const { bookName, title, author, publisher, photo, categoryName, price, stock } = req.body;

    const query = 'INSERT INTO books (BookName, Title, Author, Publisher, photo, CategoryName, Price, Stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [bookName, title, author, publisher, photo, categoryName, price, stock], (err, result) => {
        if (err) {
            console.error(err); // แสดงข้อผิดพลาดในคอนโซล
            return res.status(500).send('Server Error');
        }
        console.log('Book added:', result.insertId);
        res.redirect('/userAdmin');
    });
});

module.exports = router;
