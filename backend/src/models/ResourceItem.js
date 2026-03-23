const mongoose = require('mongoose');

const resourceItemSchema = new mongoose.Schema({
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResourceFolder',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['pdf', 'link', 'video', 'image'],
    default: 'pdf',
  },
  url: {
    type: String,
    required: true,
  },
  cloudinaryId: {
    type: String, // Cloudinary public_id for deletion
  },
  order: {
    type: Number,
    default: 0,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('ResourceItem', resourceItemSchema);
