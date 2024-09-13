var express = require('express');
var router = express.Router();
var connection = require('../connect'); // ใช้ตัวแปร connection เป็น connection

// Route สำหรับเพิ่มหนังสือใหม่
router.post('/', (req, res) => {
    var { bookName, title, author, publisher, photo, categoryName, price, stock } = req.body;

    var query = 'INSERT INTO books (BookName, Title, Author, Publisher, photo, CategoryName, Price, Stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [bookName, title, author, publisher, photo, categoryName, price, stock], (err, result) => {
        if (err) {
            console.error(err); // แสดงข้อผิดพลาดในคอนโซล
            return res.status(500).send('Server Error');
        }
        console.log('Book added:', result.insertId);
        res.redirect('/userAdmin');
    });
});

// Route สำหรับแสดงข้อมูลหนังสือในหน้า userAdmin
router.get('/', (req, res) => {
    var query = 'SELECT BookName FROM books';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err); // แสดงข้อผิดพลาดในคอนโซล
            return res.status(500).send('Error fetching data');
        }
        
        // เรนเดอร์หน้า userAdmin.ejs และส่งข้อมูล books ไปยัง view
        res.redirect('/userAdmin', { books: results });
    });
});

module.exports = router;
