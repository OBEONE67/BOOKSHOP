var express = require('express');
var router = express.Router();
var connection = require('../connect'); // นำเข้าการเชื่อมต่อฐานข้อมูล
const { v4: uuidv4 } = require('uuid'); // นำเข้า uuid
const { createCanvas, registerFont } = require('canvas'); // นำเข้า canvas
const { loadImage } = require('canvas');
const fs = require('fs'); // นำเข้า fs สำหรับจัดการไฟล์

// นำเข้าฟอนต์ TH Sarabun New จากไฟล์ .ttf ที่ดาวน์โหลด
registerFont('./fonts/THSarabunNew.ttf', { family: 'TH Sarabun New' });

/* POST confirm payment */
router.post('/confirm', (req, res) => {
    const { totalAmount, paymentMethod } = req.body;
    const userId = req.session.user.userid;
    const username = req.session.user.username;

    // สร้าง Transaction ID ใหม่
    const transactionID = uuidv4();

    const sql = `
        INSERT INTO payments (OrderID, UserID, Quantity, PaymentMethod, Status, TransactionID)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const orderIdArray = req.session.orders.map(order => order.OrderID);

    connection.query(sql, [orderIdArray.join(','), userId, totalAmount, paymentMethod, 'Completed', transactionID], (err, result) => {
        if (err) {
            console.error('Error processing payment:', err);
            return res.status(500).send('เกิดข้อผิดพลาดในการทำรายการชำระเงิน');
        }

        const updateOrderSql = `UPDATE orders SET Status = 'Completed' WHERE UserID = ? AND OrderID IN (?)`;
        connection.query(updateOrderSql, [userId, orderIdArray], (err) => {
            if (err) {
                console.error('Error updating orders:', err);
                return res.status(500).send('เกิดข้อผิดพลาดในการอัพเดตสถานะคำสั่งซื้อ');
            }

            const updateStockSql = `
                UPDATE books
                SET Stock = Stock - (
                    SELECT SUM(Quantity) FROM orders WHERE orders.BookID = books.BookID AND orders.OrderID IN (?)
                )
                WHERE BookID IN (SELECT BookID FROM orders WHERE OrderID IN (?))
            `;

            connection.query(updateStockSql, [orderIdArray, orderIdArray], (err) => {
                if (err) {
                    console.error('Error updating stock:', err);
                    return res.status(500).send('เกิดข้อผิดพลาดในการอัพเดตจำนวน stock');
                }

                // สร้างใบเสร็จในรูปแบบไฟล์รูปภาพ
                const canvas = createCanvas(600, 400);
                const ctx = canvas.getContext('2d');

                // ตั้งค่า background สีขาว
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // เพิ่มโลโก้
                const logoPath = 'https://img2.pic.in.th/pic/LOGO-Photoroom.png'; // เส้นทางของโลโก้
                loadImage(logoPath).then(logo => {
                    ctx.drawImage(logo, 20, 20, 100, 100); // ปรับขนาดโลโก้ตามต้องการ

                    // วาดกรอบสี่เหลี่ยม
                    ctx.strokeStyle = '#cccccc';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(20, 130, 560, 250);

                    // ตั้งค่าข้อความและฟอนต์
                    ctx.fillStyle = '#333333';
                    ctx.font = 'bold 24px "TH Sarabun New"';
                    ctx.fillText('ใบเสร็จการชำระเงิน', 200, 160);
                    ctx.font = '16px "TH Sarabun New"';

                    // ข้อมูลการชำระเงิน
                    ctx.fillStyle = '#000000';
                    ctx.fillText(`ชื่อผู้ใช้: ${username}`, 50, 200);
                    ctx.fillText(`Transaction ID: ${transactionID}`, 50, 230);
                    ctx.fillText(`จำนวนเงินรวม: ${totalAmount} บาท`, 50, 260);
                    ctx.fillText(`วิธีการชำระเงิน: ${paymentMethod}`, 50, 290);
                    ctx.fillText(`คำสั่งซื้อ: ${orderIdArray.join(', ')}`, 50, 320);
                    ctx.fillText('สถานะ: Completed', 50, 350);

                    // โฟลเดอร์สำหรับเก็บใบเสร็จ
                    const receiptFolder = './receipts';
                    const receiptFilename = `ใบเสร็จ_${transactionID}.png`;
                    const receiptPath = `${receiptFolder}/${receiptFilename}`;

                    // ตรวจสอบว่ามีโฟลเดอร์ receipts หรือไม่ ถ้าไม่มีให้สร้างใหม่
                    if (!fs.existsSync(receiptFolder)) {
                        fs.mkdirSync(receiptFolder);
                    }

                    // เขียนใบเสร็จลงไฟล์ .png
                    const out = fs.createWriteStream(receiptPath);
                    const stream = canvas.createPNGStream();
                    stream.pipe(out);
                    out.on('finish', () => {
                        req.session.orders = req.session.orders.filter(order => !orderIdArray.includes(order.OrderID));
                        res.render('alert', { 
                            message: 'ชำระเงินสำเร็จและอัพเดต stock สำเร็จ', 
                            messageType: 'success', 
                            redirectUrl: '/', 
                            receiptPath: `/receipts/${receiptFilename}` 
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
