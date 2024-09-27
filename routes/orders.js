var express = require('express');
var router = express.Router();
var connection = require('../connect'); // นำเข้าการเชื่อมต่อฐานข้อมูล

// Route สำหรับการยกเลิกคำสั่งซื้อ
router.post('/cancel-order', async (req, res) => {
    const orderId = req.body.orderId;
    const userID = req.session.user ? req.session.user.userid : null;

    // ตรวจสอบว่าผู้ใช้ได้เข้าสู่ระบบหรือไม่
    if (!userID) {
        return res.render('alert', { message: 'กรุณาเข้าสู่ระบบเพื่อยกเลิกคำสั่งซื้อ', messageType: 'error', redirectUrl: '/login' });
    }

    // ลบคำสั่งซื้อจากฐานข้อมูล
    const deleteOrderQuery = `DELETE FROM Orders WHERE OrderID = ? AND UserID = ?`;
    connection.query(deleteOrderQuery, [orderId, userID], (err, result) => {
        if (err) {
            console.error('Error deleting order:', err);
            return res.render('alert', { message: 'เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ', messageType: 'error', redirectUrl: '/orders' });
        }

        // ตรวจสอบว่ามีการลบคำสั่งซื้อหรือไม่
        if (result.affectedRows > 0) {
            res.redirect('/orders'); // รีไดเรกต์ไปยังหน้ารายการคำสั่งซื้อ
        } else {
            res.render('alert', { message: 'ไม่พบคำสั่งซื้อที่ต้องการยกเลิก', messageType: 'error', redirectUrl: '/orders' });
        }
    });
});

// Route สำหรับการยกเลิกคำสั่งซื้อทั้งหมด
router.post('/cancel-all', async (req, res) => {
    const userID = req.session.user ? req.session.user.userid : null;

    // ตรวจสอบว่าผู้ใช้ได้เข้าสู่ระบบหรือไม่
    if (!userID) {
        return res.render('alert', { message: 'กรุณาเข้าสู่ระบบเพื่อยกเลิกคำสั่งซื้อ', messageType: 'error', redirectUrl: '/login' });
    }

    // ลบคำสั่งซื้อทั้งหมดของผู้ใช้จากฐานข้อมูล
    const deleteAllOrdersQuery = `DELETE FROM Orders WHERE UserID = ?`;
    connection.query(deleteAllOrdersQuery, [userID], (err, result) => {
        if (err) {
            console.error('Error deleting all orders:', err);
            return res.render('alert', { message: 'เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อทั้งหมด', messageType: 'error', redirectUrl: '/orders' });
        }

        // ตรวจสอบว่ามีการลบคำสั่งซื้อหรือไม่
        if (result.affectedRows > 0) {
            res.redirect('/orders'); // รีไดเรกต์ไปยังหน้ารายการคำสั่งซื้อ
        } else {
            res.render('alert', { message: 'ไม่พบคำสั่งซื้อใด ๆ ที่ต้องการยกเลิก', messageType: 'error', redirectUrl: '/orders' });
        }
    });
});

module.exports = router;
