const mongoose = require('mongoose');
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  streamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream', required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model('Subject', subjectSchema);
