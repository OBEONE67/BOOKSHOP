const express = require('express');
const router = express.Router();
const connection = require('../connect'); // นำเข้าการเชื่อมต่อฐานข้อมูล

// เส้นทางสำหรับแสดงหน้าสั่งซื้อ
router.get('/', async (req, res) => {
    try {
        const userId = req.session.userid; // สมมติว่าเรามี ID ของผู้ใช้ใน session
        const orders = await connection.query('SELECT * FROM Orders WHERE UserID = ?', [userId]); // ดึงข้อมูลคำสั่งซื้อสำหรับผู้ใช้

        res.render('order', { orders });
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
});

module.exports = router;
