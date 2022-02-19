const { body, validationResult } = require('express-validator');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const User = require('../models/user');

const INVITECODE = process.env.INVITECODE;

exports.getSignupForm = (req, res, next) => {
  res.render(
    'signup',
    {
      title: 'Sign up',
      user: {}
    }
  );
}

exports.getSignupValidationRules = () => {
  return [
    body('username')
      .trim().isLength({ min: 1}).escape().withMessage('Username required')
      .isLength({ max: 100}).withMessage('Username must be less than 100 characters'),
    body('password')
      .trim().isLength({ min: 1}).escape().withMessage('Password required'),
    body('password2')
      .trim().isLength({ min: 1}).escape().withMessage('Please retype your password')
      .custom((value, { req }) => value === req.body.password).withMessage('Passwords don\'t match'),
    body('nickname')
      .trim().isLength({ min: 1}).escape().withMessage('Nickname required')
      .isLength({ max: 100}).withMessage('Nickname must be less than 100 characters'),
    body('inviteCode')
      .trim().isLength({ min: 1}).escape().withMessage('Invite code required')
      .equals(INVITECODE).withMessage('Incorrect invite code'),
    body('giveAdminRole')
      .optional({checkFalsy: true}).escape(),
  ];
}

exports.processSignupForm = async (req, res, next) => {
  try {
    // hash the password
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const role = req.body.giveAdminRole === 'on' ? 'admin' : 'user';

    // create new user
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
      nickname: req.body.nickname,
      role: role,
    });

    // check for validation errors
    const formErrors = validationResult(req);
    if (!formErrors.isEmpty()) {
      // redisplay the form
      res.render(
        'signup',
        {
          title: 'Sign up',
          user: newUser,
          errors: formErrors.array(),
        }
      );
    } else {
      try {
        // save user to db
        await newUser.save();

        // success!
        res.render(
          'signupSuccess'
        );
      } catch (err) {
        if (err.code === 11000 ) {
          // username taken. Try again!
          res.render(
            'signup',
            {
              title: 'Sign up',
              user: newUser,
              errors: [{msg: 'Username is taken'}],
            }
          );
        } else {
          return next(err);
        }
      }
      
    }
  } catch (err) {
    return next(err);
  }
}