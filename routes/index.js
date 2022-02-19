var express = require('express');
var router = express.Router();
const passport = require('passport');

// controllers
const messageController = require('../controllers/messageController');
const userController = require('../controllers/userController');

/* home page. */
router.get('/', messageController.getMessageList);

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
    failureRedirect: '/sign-in-error',
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
