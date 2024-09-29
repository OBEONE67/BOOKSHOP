var express = require('express');
var router = express.Router();
var connection = require('../connect'); // นำเข้าการเชื่อมต่อฐานข้อมูล
const { v4: uuidv4 } = require('uuid'); // นำเข้า uuid

/* POST confirm payment */
router.post('/confirm', (req, res) => {
    const { totalAmount, paymentMethod } = req.body;
    const userId = req.session.user.userid; // ใช้ UserID จาก session

    // สร้าง Transaction ID ใหม่
    const transactionID = uuidv4(); // สร้าง Transaction ID

    // สร้างคำสั่ง SQL สำหรับการบันทึกการชำระเงิน
    const sql = `
        INSERT INTO payments (OrderID, UserID, Quantity, PaymentMethod, Status, TransactionID)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    // ดึง OrderID ของคำสั่งซื้อทั้งหมด
    const orderIdArray = req.session.orders.map(order => order.OrderID); 

    connection.query(sql, [orderIdArray.join(','), userId, totalAmount, paymentMethod, 'Completed', transactionID], (err, result) => {
        if (err) {
            console.error('Error processing payment:', err);
            return res.status(500).send('เกิดข้อผิดพลาดในการทำรายการชำระเงิน');
        }

        // อัพเดตสถานะคำสั่งซื้อในตาราง orders สำหรับผู้ใช้ที่ระบุ
        const updateOrderSql = `UPDATE orders SET Status = 'Completed' WHERE UserID = ? AND OrderID IN (?)`;

        connection.query(updateOrderSql, [userId, orderIdArray], (err) => {
            if (err) {
                console.error('Error updating orders:', err);
                return res.status(500).send('เกิดข้อผิดพลาดในการอัพเดตสถานะคำสั่งซื้อ');
            }

            // ลบคำสั่งซื้อออกจาก session
            req.session.orders = req.session.orders.filter(order => !orderIdArray.includes(order.OrderID));

            // ส่งผู้ใช้ไปยังหน้าแสดงผลการชำระเงินสำเร็จ
            res.render('alert', { message: 'ชำระเงินสำเร็จ', messageType: 'success', redirectUrl: '/' });
        });
    });
});

module.exports = router;
