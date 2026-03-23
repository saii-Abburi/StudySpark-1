const mongoose = require('mongoose');
const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourceCard', required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model('Chapter', chapterSchema);
