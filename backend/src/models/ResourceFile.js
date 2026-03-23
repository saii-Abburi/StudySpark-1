const mongoose = require('mongoose');
const resourceFileSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  fileUrl: { type: String, required: true },
  cloudinaryId: { type: String },
  fileType: { type: String, enum: ['pdf', 'image', 'video', 'link'], default: 'pdf' },
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: Number, default: 0 },
  isFreePreview: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('ResourceFile', resourceFileSchema);
