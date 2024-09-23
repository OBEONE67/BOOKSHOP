const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var registerRouter = require('./routes/register');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var userAdminRouter = require('./routes/userAdmin');
var cartRouter = require('./routes/cart');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.set('views', './views/');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/uploads', express.static('uploads'));


app.use(session({
  secret: 'test',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // ใช้ secure: true ถ้าใช้ HTTPS 
}))

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.get('/cart', (req, res) => {
  const cart = req.session.cart || []; // ดึงข้อมูลรถเข็นจาก session
  res.render('cart', { cart: cart }); // ส่งข้อมูลไปยัง template
});


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/userAdmin', userAdminRouter);
app.use('/cart', cartRouter);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
