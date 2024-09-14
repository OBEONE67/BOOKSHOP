var express = require('express');
var router = express.Router();
var connection = require('../connect');
var multer = require('multer');
var path = require('path');

router.get('/', (req, res) => {
    var query = 'SELECT BookName, Title, Author, Publisher, Photo, CategoryName, Price, Stock FROM books';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).send('Error fetching data');
        }
        
        // ส่งข้อมูล books ไปที่หน้า userAdmin.ejs
        res.render('userAdmin', { books: results });
    });
});


// ตั้งค่า storage สำหรับ multer เพื่อเก็บไฟล์ในโฟลเดอร์ uploads
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // โฟลเดอร์ที่เก็บไฟล์
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์ด้วย timestamp และนามสกุลเดิม
    }
});

var upload = multer({ storage: storage });

// Route สำหรับเพิ่มหนังสือใหม่
router.post('/', upload.single('photo'), (req, res) => {
    var { bookName, title, author, publisher, categoryName, price, stock } = req.body;
    var photo = req.file ? req.file.filename : null; // เก็บชื่อไฟล์รูปภาพ

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
    var query = 'SELECT * FROM books';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err); // แสดงข้อผิดพลาดในคอนโซล
            return res.status(500).send('Error fetching data');
        }

        // เรนเดอร์หน้า userAdmin.ejs และส่งข้อมูล books ไปยัง view
        res.render('userAdmin', { books: results });
    });
});

module.exports = router;
