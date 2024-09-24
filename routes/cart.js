var express = require('express');
var router = express.Router();
var connection = require('../connect'); // Import the database connection

// POST route to add book to cart
router.post('/', (req, res) => {
    const bookID = req.body.bookID;
    const quantity = parseInt(req.body.quantity, 10) || 1; // ตรวจสอบและใช้ quantity จากฟอร์ม, ค่าเริ่มต้นคือ 1

    // ตรวจสอบว่า bookID มีอยู่หรือไม่
    if (!bookID) {
        return res.status(400).send('Book ID is required');
    }

    // ดึงข้อมูลหนังสือจากฐานข้อมูลโดยใช้ bookID
    const query = 'SELECT * FROM books WHERE BookID = ?';
    connection.query(query, [bookID], (err, results) => {
        if (err) {
            return res.status(500).send('Database error');
        }

        const book = results[0]; // สมมติว่าผลลัพธ์จาก query จะเป็น array

        if (!book) {
            return res.status(404).send('Book not found');
        }

        // ตรวจสอบว่า session.cart มีอยู่หรือไม่
        if (!req.session.cart) {
            req.session.cart = [];
        }

        // ตรวจสอบว่าหนังสืออยู่ในตะกร้าหรือไม่
        const existingBook = req.session.cart.find(item => item.BookID === book.BookID);
        if (existingBook) {
            // เพิ่มจำนวนถ้ามีอยู่แล้ว
            existingBook.Quantity += quantity;
        } else {
            // เพิ่มข้อมูลหนังสือลงใน session
            req.session.cart.push({
                BookID: book.BookID,
                BookName: book.BookName,
                Price: book.Price,
                Photo: book.photo ? `/uploads/${book.photo}` : null, // ถ้าไม่มีรูปให้เป็น null
                Quantity: quantity // ใช้จำนวนที่ผู้ใช้ระบุ
            });
        }

        // หลังจากเพิ่มสินค้าเสร็จ redirect ไปยังหน้า cart
        res.redirect('/');
    });
});

// POST route to remove book from cart
router.post('/remove', (req, res) => {
    const bookID = req.body.bookID;

    console.log('bookID to remove:', bookID);
    console.log('Current cart:', req.session.cart);

    // ตรวจสอบว่า bookID มีอยู่หรือไม่
    if (!bookID) {
        return res.status(400).send('Book ID is required');
    }

    // ตรวจสอบว่า session.cart มีอยู่หรือไม่
    if (req.session.cart) {
        const itemIndex = req.session.cart.findIndex(item => item.BookID === parseInt(bookID, 10)); // แปลง bookID เป็นตัวเลข
        
        if (itemIndex > -1) {
            const existingBook = req.session.cart[itemIndex];
            
            if (existingBook.Quantity > 1) {
                // ถ้ามีจำนวนมากกว่า 1 ลดจำนวนลง 1
                existingBook.Quantity -= 1;
            } else {
                // ถ้ามีเพียง 1 ลบสินค้าจาก session.cart
                req.session.cart.splice(itemIndex, 1);
            }
            
            // อัปเดต session.cart หลังจากลบสินค้า
            req.session.save(() => {
                res.redirect('/cart');
            });
        } else {
            return res.status(404).send('Book not found in cart');
        }
    } else {
        return res.status(404).send('Cart is empty');
    }
});

module.exports = router;
