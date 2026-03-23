const mongoose = require('mongoose');

const resourceFolderSchema = new mongoose.Schema({
  stream: {
    type: String,
    required: true,
    enum: ['engineering', 'agriculture'],
  },
  subject: {
    type: String,
    required: true,
    // Engineering: 'maths-a', 'maths-b', 'physics', 'chemistry'
    // Agriculture: 'zoology', 'botany', 'physics', 'chemistry'
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('ResourceFolder', resourceFolderSchema);
