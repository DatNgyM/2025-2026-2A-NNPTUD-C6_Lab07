var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
// Bo %20 thua cuoi path (vd register%20 -> register)
app.use(function (req, res, next) {
  if (!req.url) return next();
  const q = req.url.indexOf('?');
  const pathOnly = q === -1 ? req.url : req.url.slice(0, q);
  const rest = q === -1 ? '' : req.url.slice(q);
  if (/%20+$/.test(pathOnly)) {
    req.url = pathOnly.replace(/%20+$/g, '') + rest;
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//domain:port/api/v1/products
//domain:port/api/v1/users
//domain:port/api/v1/categories
//domain:port/api/v1/roles



mongoose.connect('mongodb://localhost:27017/NNPTUD-C6');
mongoose.connection.on('connected', function () {
  console.log("connected");
})
mongoose.connection.on('disconnected', function () {
  console.log("disconnected");
})

app.use('/', require('./routes/index'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/products', require('./routes/products'))
app.use('/api/v1/categories', require('./routes/categories'))
app.use('/api/v1/inventories', require('./routes/inventories'))
// catch 404 — khong dung views (tranh crash khi thieu views/error.pug)
app.use(function (req, res, next) {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      message: 'Khong tim thay API',
      path: req.path,
      hint: 'Kiem tra URL: khong co dau cach cuoi (vd: /api/v1/auth/register khong phai register )'
    });
  }
  next(createError(404));
});

// error handler — JSON (project API, khong bat buoc thu muc views)
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  const body = {
    message: err.message || 'Loi server',
    status: status
  };
  if (req.app.get('env') === 'development' && err.stack) {
    body.stack = err.stack;
  }
  res.status(status).json(body);
});

module.exports = app;
