var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/BOOKTYPE1', function(req, res, next) {
  res.render('BOOKTYPE1', { title: 'Express' });
});

module.exports = router;
