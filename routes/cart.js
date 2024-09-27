var express = require('express');
var router = express.Router();
var connection = require('../connect'); // นำเข้าการเชื่อมต่อฐานข้อมูล

// POST route to add book to cart
router.post('/', (req, res) => {
    // ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง
    if (!req.session.user) {
        return res.render('alert', { message: 'Please login first', messageType: 'error', redirectUrl: '/login' });
    }

    const bookID = req.body.bookID;
    const quantity = parseInt(req.body.quantity, 10) || 1;
    const userID = req.session.user.userid;

    if (!bookID || !userID) {
        return res.render('alert', { message: 'Book ID and User ID are required', messageType: 'error', redirectUrl: '/cart' });
    }

    const query = 'SELECT * FROM books WHERE BookID = ?';
    connection.query(query, [bookID], (err, results) => {
        if (err) {
            console.error(err);
            return res.render('alert', { message: 'Database error', messageType: 'error', redirectUrl: '/cart' });
        }

        const book = results[0];
        if (!book) {
            return res.render('alert', { message: 'Book not found', messageType: 'error', redirectUrl: '/cart' });
        }

        // ตรวจสอบ stock ก่อนที่จะเพิ่ม
        if (book.Stock < quantity) {
            return res.render('alert', { message: `Not enough stock. Available: ${book.Stock}`, messageType: 'error', redirectUrl: '/' });
        }

        if (!req.session.cart) {
            req.session.cart = [];
        }

        const existingBook = req.session.cart.find(item => item.BookID === book.BookID);
        if (existingBook) {
            // หากมีอยู่แล้ว เพิ่มจำนวนโดยอัตโนมัติ
            existingBook.Quantity += quantity;

            const updateQuery = 'UPDATE Cart SET Quantity = ? WHERE UserID = ? AND BookID = ?';
            connection.query(updateQuery, [existingBook.Quantity, userID, bookID], (err) => {
                if (err) {
                    console.error(err);
                    return res.render('alert', { message: 'Error updating cart', messageType: 'error', redirectUrl: '/cart' });
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

            const insertQuery = 'INSERT INTO Cart (UserID, BookID, Quantity) VALUES (?, ?, ?)';
            connection.query(insertQuery, [userID, book.BookID, quantity], (err) => {
                if (err) {
                    console.error(err);
                    return res.render('alert', { message: 'Error adding to cart', messageType: 'error', redirectUrl: '/cart' });
                }
            });
        }

        res.render('alert', { message: 'Added to cart successfully!', messageType: 'success', redirectUrl: '/' });
    });
});

// POST route to remove book from cart
router.post('/remove', (req, res) => {
    // ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง
    if (!req.session.user) {
        return res.redirect('/login?error=Please login first');
    }

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

router.post('/checkorder', (req, res) => {
    const userID = req.session.user.userid;
    const cart = req.session.cart; // ดึงข้อมูลตะกร้าสินค้า

    // ตรวจสอบการเข้าสู่ระบบ
    if (!userID) {
        return res.render('alert', { message: 'กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ', messageType: 'error', redirectUrl: '/login' });
    }

    // ตรวจสอบว่าตะกร้ามีข้อมูลหรือไม่
    if (!cart || cart.length === 0) {
        return res.render('alert', { message: 'ตะกร้าสินค้าไม่มีข้อมูล', messageType: 'error', redirectUrl: '/cart' });
    }

    // สร้างคำสั่งซื้อในฐานข้อมูลสำหรับแต่ละรายการในตะกร้า
    const orderQueries = cart.map(item => {
        const orderQuery = 'INSERT INTO Orders (OrderDate, Quantity, UserID, BookID) VALUES (NOW(), ?, ?, ?)';
        return new Promise((resolve, reject) => {
            connection.query(orderQuery, [item.Quantity, userID, item.BookID], (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });

    // รอให้คำสั่งซื้อทั้งหมดถูกบันทึก
    Promise.all(orderQueries)
        .then(() => {
            // สร้างคำสั่ง SQL เพื่อลบข้อมูลในตาราง Cart
            const deleteCartQuery = 'DELETE FROM Cart WHERE UserID = ?';
            return new Promise((resolve, reject) => {
                connection.query(deleteCartQuery, [userID], (err) => {
                    if (err) {
                        return reject(err);
                    }
                    // เคลียร์ตะกร้าสินค้าหลังจากยืนยัน
                    req.session.cart = [];
                    resolve();
                });
            });
        })
        .then(() => {
            // ดึงข้อมูลคำสั่งซื้อที่ถูกสร้างขึ้นเพื่อแสดงในหน้า cart
            const getOrderQuery = 'SELECT * FROM Orders WHERE UserID = ? ORDER BY OrderDate DESC';
            connection.query(getOrderQuery, [userID], (err, orders) => {
                if (err) {
                    console.error('Error retrieving orders:', err);
                    return res.render('alert', { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ', messageType: 'error', redirectUrl: '/' });
                }

                // แสดงข้อมูลคำสั่งซื้อในหน้า cart
                res.render('cart', { cart: [], orders }); // ส่ง cart ที่ว่างเปล่าและ orders ไปยังหน้า cart
            });

        })
        .catch(err => {
            console.error('Error during order saving:', err);
            res.render('alert', { message: 'เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ', messageType: 'error', redirectUrl: '/cart' });
        });
});



module.exports = router;
