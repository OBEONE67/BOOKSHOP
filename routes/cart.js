var express = require('express');
var router = express.Router();
var connection = require('../connect'); // นำเข้าการเชื่อมต่อฐานข้อมูล

// POST route to add book to cart
router.post('/', (req, res) => {
    const bookID = req.body.bookID;
    const quantity = parseInt(req.body.quantity, 10) || 1; // ตรวจสอบและใช้ quantity จากฟอร์ม, ค่าเริ่มต้นคือ 1
    const userID = req.session.user.userid; // เก็บ UserID จาก session

    // ตรวจสอบว่า bookID มีอยู่หรือไม่
    if (!bookID || !userID) {
        return res.status(400).send('Book ID and User ID are required');
    }

    // ดึงข้อมูลหนังสือจากฐานข้อมูลโดยใช้ bookID
    const query = 'SELECT * FROM books WHERE BookID = ?';
    connection.query(query, [bookID], (err, results) => {
        if (err) {
            return res.status(500).send('Database error');
        }

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

            // อัปเดตฐานข้อมูล
            const updateQuery = 'UPDATE Cart SET Quantity = ? WHERE UserID = ? AND BookID = ?';
            connection.query(updateQuery, [existingBook.Quantity, userID, bookID], (err) => {
                if (err) {
                    console.error(err);
                }
            });
        } else {
            // เพิ่มข้อมูลหนังสือลงใน session
            req.session.cart.push({
                BookID: book.BookID,
                BookName: book.BookName,
                Price: book.Price,
                Photo: book.photo ? `/uploads/${book.photo}` : null, // ถ้าไม่มีรูปให้เป็น null
                Quantity: quantity // ใช้จำนวนที่ผู้ใช้ระบุ
            });

            // บันทึกลงในฐานข้อมูล
            const insertQuery = 'INSERT INTO Cart (UserID, BookID, Quantity) VALUES (?, ?, ?)';
            connection.query(insertQuery, [userID, book.BookID, quantity], (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }

        // หลังจากเพิ่มสินค้าเสร็จ redirect ไปยังหน้า cart
        res.redirect('/cart'); // เปลี่ยนจาก '/' เป็น '/cart'
    });
});


// POST route to remove book from cart
router.post('/remove', (req, res) => {
    const bookID = req.body.bookID;
    const userID = req.session.user.userid; // เก็บ UserID จาก session

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

                // อัปเดตฐานข้อมูล
                const updateQuery = 'UPDATE Cart SET Quantity = ? WHERE UserID = ? AND BookID = ?';
                connection.query(updateQuery, [existingBook.Quantity, userID, bookID], (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            } else {
                // ถ้ามีเพียง 1 ลบสินค้าจาก session.cart และฐานข้อมูล
                req.session.cart.splice(itemIndex, 1);

                // ลบออกจากฐานข้อมูล
                const deleteQuery = 'DELETE FROM Cart WHERE UserID = ? AND BookID = ?';
                connection.query(deleteQuery, [userID, bookID], (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
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
