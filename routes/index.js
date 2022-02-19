var express = require('express');
var router = express.Router();

const messageController = require('../controllers/messageController');
const userController = require('../controllers/userController');

/* GET home page. */
router.get('/', messageController.getMessageList);

// sign up form
router.get('/sign-up', userController.getSignupForm);
router.post('/sign-up',
  userController.getSignupValidationRules(),
  userController.processSignupForm
);

module.exports = router;
