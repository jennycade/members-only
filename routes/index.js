var express = require('express');
var router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// controllers
const messageController = require('../controllers/messageController');
const userController = require('../controllers/userController');

// authentication
// set up LocalStrategy
const User = require('../models/user');
passport.use(
  new LocalStrategy((username, password, done) => {
    console.log(`Trying to log in with username ${username}, password ${password}`)
    User.findOne({ username }, (err, user) => {
      if (err) {
        console.log(`There's an error trying to log in with username ${username}, password ${password}`)
        return done(err);
      }
      if (!user) {
        // user not found
        connsole.log(`${username} doesn't match any user`);
        return done(null, false, { message: 'Incorrect username' });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // match
          return done(null, user);
        } else {
          // no match
          console.log(`${password} doesn't match ${user.password}`);
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

///////// ROUTES

/* home page. */
router.get('/', messageController.getMessageList);

/* messages */
router.get('/create-message', (req, res) => {
  res.render('createMessageForm', {title: 'Create message'});
});

router.post('/create-message',
  messageController.getValidationRules(),
  messageController.processForm,
);

router.get('/delete/:id', messageController.getDeleteForm);
router.post('/delete/:id',
  messageController.getDeleteValidationRules(),
  messageController.deletePost,
);

/* authentication */

// sign up form
router.get('/sign-up', userController.getSignupForm);
router.post('/sign-up',
  userController.getSignupValidationRules(),
  userController.processSignupForm
);

// sign in form
router.post('/sign-in',
  userController.getSigninValidationRules(),
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/sign-in-error'
  })
);
router.get('/sign-in-error', (req, res) => {
  res.render('signinError', {title: 'Error signing in'});
});

// sign out form
router.get('/sign-out', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
