var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// for authentication
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// connect to db
const dotenv = require('dotenv').config();
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

// set up LocalStrategy
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        // user not found
        return done(null, false, { message: 'Incorrect username' });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // match
          return done(null, user);
        } else {
          // no match
          return done(null, false, { message: 'Incorrect password' });
        }
      });
    })
  })
);

// set up sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// start passport
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// middleware for user variable
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

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
