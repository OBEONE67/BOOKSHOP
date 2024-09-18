var express = require('express');
var router = express.Router();
var connection = require('../connect');
var multer = require('multer');
var path = require('path');
var fs = require('fs'); // ใช้ในการลบไฟล์

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
                return res.status(500).send('Server Error');
            } else {
                req.session.books = result;
                res.render('useradmin', { books: req.session.books });
            }
        });
    });
});

// ลบหนังสือ
router.post('/books/delete/:id', (req, res) => {
    const bookId = req.params.id;

    // เรียกดูรายละเอียดหนังสือก่อนลบ
    connection.query('SELECT photo FROM books WHERE id = ?', [bookId], (err, results) => {
        if (err) throw err;

        // ลบไฟล์ภาพที่เกี่ยวข้อง (ถ้ามี)
        if (results.length > 0 && results[0].photo) {
            const filePath = path.join('uploads', results[0].photo);
            fs.unlink(filePath, (err) => {
                if (err) console.error('Failed to delete image:', err);
                
            });
        }

        // ลบหนังสือจากฐานข้อมูล
        connection.query('DELETE FROM books WHERE id = ?', [bookId], (err, result) => {
            if (err) throw err;
            res.redirect('/useradmin'); // เปลี่ยนเส้นทางไปยังหน้ารายการหนังสือ
        });
    });
});

// แสดงฟอร์มแก้ไข
router.get('/books/edit/:id', (req, res) => {
    const bookId = req.params.id;
    connection.query('SELECT * FROM books WHERE id = ?', [bookId], (err, results) => {
        if (err) throw err;
        res.render('useradmin', { book: results[0] });
    });
});

// แก้ไขข้อมูลหนังสือ
router.post('/books/update', (req, res) => {
    const { bookId, bookName, title, author, publisher, categoryName, price, stock } = req.body;

    const query = 'UPDATE books SET BookName = ?, Title = ?, Author = ?, Publisher = ?, CategoryName = ?, Price = ?, Stock = ? WHERE id = ?';
    connection.query(query, [bookName, title, author, publisher, categoryName, price, stock, bookId], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: 'Error updating book' });
        }
        res.json({ success: true });
        var sql2 = 'SELECT * FROM books';
        connection.query(sql2, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server Error');
            } else {
                req.session.books = result;
                res.render('useradmin', { books: req.session.books });
            }
        });
    });
});


module.exports = router;
