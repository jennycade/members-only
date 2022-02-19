const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userDefinitions = require('./userDefinitions');

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    maxlength: 100,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: userDefinitions.roles,
  }
});

module.exports = mongoose.model('User', UserSchema);