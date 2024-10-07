const express = require('express');
const path = require('path');
const app = express();

// ให้บริการไฟล์ในโฟลเดอร์ receipts
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// โค้ดอื่น ๆ ที่เกี่ยวข้องกับเซิร์ฟเวอร์
