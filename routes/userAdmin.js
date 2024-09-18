var express = require('express');
var router = express.Router();
var connection = require('../connect');
var multer = require('multer');
var path = require('path');

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
        var sql2 = 'SELECT * FROM books';
        connection.query(sql2, (err, result) => {
            if (err) {
                console.error(err);
            } else {
                req.session.books = result;
                res.render('useradmin', { books: req.session.books });
            }
        });
    });
});

// Route สำหรับแสดงหน้าแก้ไขหนังสือ
router.get('/editbook/:BookID', (req, res) => {
    var BookID = req.params.BookID;
    var query = 'SELECT * FROM books WHERE BookID = ?';
    
    connection.query(query, [BookID], (err, result) => {
        if (err) {
            console.error(err); // แสดงข้อผิดพลาดในคอนโซล
            return res.status(500).send('Error retrieving book data');
        }
        if (result.length === 0) {
            return res.status(404).send('Book not found');
        }
        res.render('editbook', { book: result[0] }); // ส่งข้อมูลหนังสือไปยังหน้า editbook.ejs
    });
});

// Route สำหรับอัปเดตหนังสือ
router.post('/editbook/:BookID', upload.single('photo'), (req, res) => {
    var BookID = req.params.BookID;
    var { bookName, title, author, publisher, categoryName, price, stock } = req.body;
    var photo = req.file ? req.file.filename : null; // ถ้ามีการอัปโหลดรูปใหม่

    // สร้าง query สำหรับการอัปเดต
    var updateQuery = `
        UPDATE books 
        SET BookName = ?, Title = ?, Author = ?, Publisher = ?, CategoryName = ?, Price = ?, Stock = ? 
        ${photo ? ', photo = ?' : ''} 
        WHERE BookID = ?
    `;
    
    // สร้าง array ของพารามิเตอร์สำหรับ query
    var params = [bookName, title, author, publisher, categoryName, price, stock];
    if (photo) params.push(photo); // ถ้ามีการอัปโหลดรูปใหม่ ให้เพิ่ม photo ในพารามิเตอร์
    params.push(BookID);

    connection.query(updateQuery, params, (err, result) => {
        if (err) {
            console.error(err); // แสดงข้อผิดพลาดในคอนโซล
            return res.status(500).send('Error updating the book');
        }
        console.log('Book updated:', BookID);
        var sql2 = 'SELECT * FROM books';
        connection.query(sql2, (err, result) => {
            if (err) {
                console.error(err);
            } else {
                req.session.books = result;
                res.render('useradmin', { books: req.session.books }); // หลังจากอัปเดตเสร็จ กลับไปหน้าแอดมิน
    }
        });
    });
});

// Route สำหรับลบหนังสือ
router.get('/deletebook/:BookID', (req, res) => {
    var BookID = req.params.BookID;
    var query = 'DELETE FROM books WHERE BookID = ?';
    
    connection.query(query, [BookID], (err, result) => {
        if (err) {
            console.error(err); // แสดงข้อผิดพลาดในคอนโซล
            return res.status(500).send('Error deleting the book');
        }
        console.log('Book deleted:', BookID);
        var sql2 = 'SELECT * FROM books';
        connection.query(sql2, (err, result) => {
            if (err) {
                console.error(err);
            } else {
                req.session.books = result;
                res.render('useradmin', { books: req.session.books }); // หลังจากลบเสร็จ กลับไปหน้าแอดมิน
            }
        });
    });
});

module.exports = router;
