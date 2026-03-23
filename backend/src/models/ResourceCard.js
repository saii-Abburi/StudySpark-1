const mongoose = require('mongoose');
const resourceCardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  icon: { type: String, default: '📄' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPremium: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model('ResourceCard', resourceCardSchema);
