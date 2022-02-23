var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// for authentication
const session = require('express-session');
const passport = require('passport');

// mongoose
const mongoose = require('mongoose');

// deployment
const compression = require('compression');
const helmet = require('helmet');

// connect to db
require('dotenv').config();
const mongoDb = process.env.MONGOURI;
mongoose.connect(
  mongoDb,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }
);
const db = mongoose.connection;
db.on(
  'error',
  console.error.bind(console, 'mongo connection error')
);

// routers
var indexRouter = require('./routes/index');

// start express
var app = express();

// deployment
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// authentication
app.use(session({
  secret: 'V3b0E3WVV0DyVeIytI0b',
  resave: false,
  saveUninitialized: true,
}));

// start passport
// app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// middleware for user variable
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// deployment
app.use(compression());

// routes
app.use('/', indexRouter);

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
