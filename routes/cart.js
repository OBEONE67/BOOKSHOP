var express = require('express');
var router = express.Router();
var connection = require('../connect'); // นำเข้าการเชื่อมต่อฐานข้อมูล

// POST route to add book to cart
router.post('/', (req, res) => {
    const bookID = req.body.bookID;
    const quantity = parseInt(req.body.quantity, 10) || 1;
    const userID = req.session.user.userid;

    if (!bookID || !userID) {
        return res.status(400).send('Book ID and User ID are required');
    }

    const query = 'SELECT * FROM books WHERE BookID = ?';
    connection.query(query, [bookID], (err, results) => {
        if (err) {
            return res.status(500).send('Database error');
        }

        const book = results[0];
        if (!book) {
            return res.status(404).send('Book not found');
        }

        if (!req.session.cart) {
            req.session.cart = [];
        }

        const existingBook = req.session.cart.find(item => item.BookID === book.BookID);
        if (existingBook) {
            // หากมีอยู่แล้ว เพิ่มจำนวนโดยอัตโนมัติ
            existingBook.Quantity += quantity;

            // อัปเดตฐานข้อมูล
            const updateQuery = 'UPDATE Cart SET Quantity = ? WHERE UserID = ? AND BookID = ?';
            connection.query(updateQuery, [existingBook.Quantity, userID, bookID], (err) => {
                if (err) {
                    console.error(err);
                }
            });
        } else {
            // เพิ่มหนังสือใหม่เข้าไปในตะกร้า
            req.session.cart.push({
                BookID: book.BookID,
                BookName: book.BookName,
                Price: book.Price,
                Photo: book.photo ? `/uploads/${book.photo}` : null,
                Quantity: quantity
            });

            // บันทึกลงในฐานข้อมูล
            const insertQuery = 'INSERT INTO Cart (UserID, BookID, Quantity) VALUES (?, ?, ?)';
            connection.query(insertQuery, [userID, book.BookID, quantity], (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }

        // เปลี่ยนเส้นทางไปยังหน้า cart
        res.redirect('/cart');
    });
});

// POST route to remove book from cart
router.post('/remove', (req, res) => {
    const bookID = req.body.bookID;
    const userID = req.session.user.userid;

    if (!bookID) {
        return res.status(400).send('Book ID is required');
    }

    if (req.session.cart) {
        const itemIndex = req.session.cart.findIndex(item => item.BookID === parseInt(bookID, 10));
        
        if (itemIndex > -1) {
            const existingBook = req.session.cart[itemIndex];
            
            if (existingBook.Quantity > 1) {
                existingBook.Quantity -= 1;

                const updateQuery = 'UPDATE Cart SET Quantity = ? WHERE UserID = ? AND BookID = ?';
                connection.query(updateQuery, [existingBook.Quantity, userID, bookID], (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            } else {
                req.session.cart.splice(itemIndex, 1);

                const deleteQuery = 'DELETE FROM Cart WHERE UserID = ? AND BookID = ?';
                connection.query(deleteQuery, [userID, bookID], (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            }

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
    