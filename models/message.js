const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { DateTime } = require('luxon');

const MessageSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

MessageSchema.virtual('formattedCreatedAt').get(function() {
  return DateTime.fromJSDate(this.createdAt)
    .toLocaleString(DateTime.DATETIME_SHORT);
});

module.exports = mongoose.model('Message', MessageSchema);