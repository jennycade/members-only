const Message = require('../models/message');

const { body, validationResult} = require('express-validator');

exports.getMessageList = async (req, res, next) => {
  try {
    // get the messages
    const messages = await Message.find()
      .populate('user')
      .sort('createdAt desc')
      .exec();
    // render
    res.render(
      'index',
      {
        title: 'All messages',
        messages,
        currentUser: res.locals.currentUser,
      }
    )
  } catch (err) {
    return next(err);
  }
}

exports.getValidationRules = () => {
  return [
    body('messageText')
      .exists({checkFalsy: true}).withMessage('Message cannot be empty')
      .escape().trim()
  ];
};

exports.processForm = async (req, res, next) => {
  try {
    // double check that user is signed in
    if (!res.locals.currentUser._id) {
      const err = new Error('Not signed in');
      err.status = 401;
      throw err; 
    }
    // make a new message
    const message = new Message({
      user: res.locals.currentUser._id,
      text: req.body.messageText,
    });

    // check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // redisplay the form
      res.render(
        'createMessageForm',
        {
          title: 'Create message',
          errors: errors.array(),
        }
      )
    } else {
      // try saving the message
      try {
        await message.save();

        res.redirect('./');
      } catch (err) {
        return next(err);
      }
    }

  } catch (err) {
    return next(err);
  }
}

exports.getDeleteForm = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('user')
      .exec();
    res.render(
      'deleteMessageForm',
      {
        title: 'Confirm delete',
        message
      }
    )
  } catch (err) {
    return next(err);
  }
  
}