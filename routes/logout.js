// ในไฟล์ routes/logout.js
var express = require('express');
var router = express.Router();

// แก้ไข logout route
router.get('/', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.redirect('/');
      }
      res.redirect('/login');
    });
  });
  
  

module.exports = router;
