const User = require('../models/user');

exports.getSignupForm = (req, res, next) => {
  res.render(
    'signup',
    {
      title: 'Sign up',
      user: {},
    }
  );
}

