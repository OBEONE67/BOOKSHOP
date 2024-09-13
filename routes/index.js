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

/* GET BOOKTYPE1 page. */
router.get('/BOOKTYPE1', function(req, res, next) {
  res.render('BOOKTYPE1', { title: 'Express' });
});

/* GET register page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'register' });
});

/* GET User page. */
router.get('/user', function(req, res, next) {
  res.render('user', { title: 'user' });
});

/* GET User page. */
router.get('/useradmin', function(req, res, next) {
  res.render('useradmin', { title: 'useradmin' });
});

/* GET UserAdmin page. */
router.get('/useradmin', function(req, res, next) {
  res.render('useradmin', { title: 'useradmin' });
});

/* GET UserAdmin page. */
router.get('/productList', function(req, res, next) {
  res.render('productList', { title: 'productList' });
});



module.exports = router;
