var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'login' });
});

/* GET home page. */
router.get('/BOOKTYPE1', function(req, res, next) {
  res.render('BOOKTYPE1', { title: 'Express' });
});

/* GET register page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'register' });
});



module.exports = router;
