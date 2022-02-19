const Message = require('../models/message');

exports.getMessageList = async (req, res, next) => {
  try {
    // get the messages
    const messages = await Message.find().sort('createdAt desc').exec();
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