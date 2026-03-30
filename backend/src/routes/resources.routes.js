const express = require('express');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/role');
const { cloudinary, upload } = require('../utils/cloudinary');
const User = require('../models/User');

const Stream = require('../models/Stream');
const Subject = require('../models/Subject');
const ResourceCard = require('../models/ResourceCard');
const Chapter = require('../models/Chapter');
const ResourceFile = require('../models/ResourceFile');

const priorityData = require('../utils/priorityData.json');

const resourceRouter = express.Router();
const instructorOnly = [auth, allowRoles('instructor', 'admin')];

// ─── PRIORITIES ──────────────────────────────────────────────────────────────

// GET chapter priorities (Public for Landing page stats)
resourceRouter.get('/priorities', (req, res) => {
  res.json(priorityData);
});

// ─── STREAMS ─────────────────────────────────────────────────────────────────

// GET all streams (anyone logged in)
resourceRouter.get('/streams', auth, async (req, res) => {
  try {
    const streams = await Stream.find().sort({ order: 1, name: 1 });
    res.json({ streams });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST create stream (instructor)
resourceRouter.post('/streams', ...instructorOnly, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const stream = await Stream.create({ name: name.trim() });
    res.status(201).json({ stream });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Stream already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT rename stream
resourceRouter.put('/streams/:id', ...instructorOnly, async (req, res) => {
  try {
    const { name } = req.body;
    const stream = await Stream.findByIdAndUpdate(req.params.id, { name: name.trim() }, { new: true });
    if (!stream) return res.status(404).json({ error: 'Stream not found' });
    res.json({ stream });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// DELETE stream (cascades to subjects, cards, chapters, files)
resourceRouter.delete('/streams/:id', ...instructorOnly, async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);
    if (!stream) return res.status(404).json({ error: 'Stream not found' });
    await cascadeDeleteStream(stream._id);
    await stream.deleteOne();
    res.json({ message: 'Stream and all nested data deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── SUBJECTS ────────────────────────────────────────────────────────────────

resourceRouter.get('/subjects', auth, async (req, res) => {
  try {
    const { streamId } = req.query;
    if (!streamId) return res.status(400).json({ error: 'streamId is required' });
    const subjects = await Subject.find({ streamId }).sort({ order: 1, name: 1 });
    res.json({ subjects });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

resourceRouter.post('/subjects', ...instructorOnly, async (req, res) => {
  try {
    const { name, streamId } = req.body;
    if (!name || !streamId) return res.status(400).json({ error: 'name and streamId are required' });
    const subject = await Subject.create({ name: name.trim(), streamId });
    res.status(201).json({ subject });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

resourceRouter.put('/subjects/:id', ...instructorOnly, async (req, res) => {
  try {
    const { name } = req.body;
    const subject = await Subject.findByIdAndUpdate(req.params.id, { name: name.trim() }, { new: true });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json({ subject });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

resourceRouter.delete('/subjects/:id', ...instructorOnly, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    await cascadeDeleteSubject(subject._id);
    await subject.deleteOne();
    res.json({ message: 'Subject and all nested data deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── RESOURCE CARDS ──────────────────────────────────────────────────────────

resourceRouter.get('/cards', auth, async (req, res) => {
  try {
    const { subjectId } = req.query;
    if (!subjectId) return res.status(400).json({ error: 'subjectId is required' });
    const cards = await ResourceCard.find({ subjectId }).sort({ order: 1, createdAt: 1 });
    res.json({ cards });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

resourceRouter.post('/cards', ...instructorOnly, async (req, res) => {
  try {
    const { title, icon, subjectId, isPremium, price } = req.body;
    if (!title || !subjectId) return res.status(400).json({ error: 'title and subjectId are required' });
    const card = await ResourceCard.create({ 
      title: title.trim(), 
      icon: icon || '📄', 
      subjectId, 
      isPremium: !!isPremium,
      price: price || 0,
      createdBy: req.user._id 
    });
    res.status(201).json({ card });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

resourceRouter.put('/cards/:id', ...instructorOnly, async (req, res) => {
  try {
    const { title, icon, isPremium, price } = req.body;
    const update = {};
    if (title !== undefined) update.title = title.trim();
    if (icon !== undefined) update.icon = icon;
    if (isPremium !== undefined) update.isPremium = isPremium;
    if (price !== undefined) update.price = price;
    const card = await ResourceCard.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json({ card });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

resourceRouter.delete('/cards/:id', ...instructorOnly, async (req, res) => {
  try {
    const card = await ResourceCard.findById(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    await cascadeDeleteCard(card._id);
    await card.deleteOne();
    res.json({ message: 'Card and all nested data deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── CHAPTERS ────────────────────────────────────────────────────────────────

resourceRouter.get('/chapters', auth, async (req, res) => {
  try {
    const { cardId } = req.query;
    if (!cardId) return res.status(400).json({ error: 'cardId is required' });
    const chapters = await Chapter.find({ cardId }).sort({ order: 1, createdAt: 1 });
    res.json({ chapters });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

resourceRouter.post('/chapters', ...instructorOnly, async (req, res) => {
  try {
    const { title, cardId } = req.body;
    if (!title || !cardId) return res.status(400).json({ error: 'title and cardId are required' });
    const chapter = await Chapter.create({ title: title.trim(), cardId });
    res.status(201).json({ chapter });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

resourceRouter.put('/chapters/:id', ...instructorOnly, async (req, res) => {
  try {
    const { title } = req.body;
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, { title: title.trim() }, { new: true });
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
    res.json({ chapter });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

resourceRouter.delete('/chapters/:id', ...instructorOnly, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
    // Delete all files in this chapter from Cloudinary
    const files = await ResourceFile.find({ chapterId: chapter._id });
    for (const f of files) {
      if (f.cloudinaryId) await cloudinary.uploader.destroy(f.cloudinaryId, { resource_type: 'raw' }).catch(() => {});
    }
    await ResourceFile.deleteMany({ chapterId: chapter._id });
    await chapter.deleteOne();
    res.json({ message: 'Chapter deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── RESOURCE FILES ──────────────────────────────────────────────────────────

// GET files — enforce premium access control
resourceRouter.get('/files', auth, async (req, res) => {
  try {
    const { chapterId } = req.query;
    if (!chapterId) return res.status(400).json({ error: 'chapterId is required' });

    // Find parent card via chapter → card chain
    const Chapter = require('../models/Chapter');
    const chapter = await Chapter.findById(chapterId);
    const card = chapter ? await ResourceCard.findById(chapter.cardId) : null;

    // Determine if user has access
    const isInstructor = ['instructor', 'admin'].includes(req.user.role);
    const hasPurchased = card?.isPremium
      ? (await User.findById(req.user._id).select('purchasedResources'))
          ?.purchasedResources?.some(id => id.equals(card._id))
      : true;

    const files = await ResourceFile.find({ chapterId }).sort({ order: 1, createdAt: 1 });

    // For students without access: hide fileUrl on locked files
    const result = files.map(f => {
      const obj = f.toObject();
      if (!isInstructor && card?.isPremium && !hasPurchased && !f.isFreePreview) {
        obj.fileUrl = null;
        obj.isLocked = true;
      }
      return obj;
    });

    res.json({ files: result, cardIsPremium: card?.isPremium || false, hasPurchased: isInstructor ? true : !!hasPurchased, cardPrice: card?.price || 0, cardId: card?._id });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

resourceRouter.post('/files', ...instructorOnly, upload.single('file'), async (req, res) => {
  try {
    const { title, chapterId, fileType, fileUrl, isFreePreview } = req.body;
    if (!title || !chapterId) return res.status(400).json({ error: 'title and chapterId are required' });

    let url = fileUrl;
    let cloudinaryId = null;
    if (req.file) {
      url = req.file.path;
      cloudinaryId = req.file.filename;
    }
    if (!url) return res.status(400).json({ error: 'Either upload a file or provide a URL' });

    const file = await ResourceFile.create({
      title: title.trim(), fileUrl: url, cloudinaryId,
      fileType: fileType || 'pdf', chapterId, uploadedBy: req.user._id,
      isFreePreview: isFreePreview === 'true' || isFreePreview === true,
    });
    res.status(201).json({ file });
  } catch (err) { res.status(500).json({ error: err.message || 'Server error' }); }
});

resourceRouter.delete('/files/:id', ...instructorOnly, async (req, res) => {
  try {
    const file = await ResourceFile.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    if (file.cloudinaryId) {
      await cloudinary.uploader.destroy(file.cloudinaryId, { resource_type: 'raw' }).catch(() => {});
    }
    await file.deleteOne();
    res.json({ message: 'File deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── CASCADE HELPERS ─────────────────────────────────────────────────────────

async function cascadeDeleteCard(cardId) {
  const chapters = await Chapter.find({ cardId });
  for (const ch of chapters) {
    const files = await ResourceFile.find({ chapterId: ch._id });
    for (const f of files) {
      if (f.cloudinaryId) await cloudinary.uploader.destroy(f.cloudinaryId, { resource_type: 'raw' }).catch(() => {});
    }
    await ResourceFile.deleteMany({ chapterId: ch._id });
  }
  await Chapter.deleteMany({ cardId });
}

async function cascadeDeleteSubject(subjectId) {
  const cards = await ResourceCard.find({ subjectId });
  for (const card of cards) await cascadeDeleteCard(card._id);
  await ResourceCard.deleteMany({ subjectId });
}

async function cascadeDeleteStream(streamId) {
  const subjects = await Subject.find({ streamId });
  for (const subject of subjects) await cascadeDeleteSubject(subject._id);
  await Subject.deleteMany({ streamId });
}

// ─── PURCHASE MOCK ───────────────────────────────────────────────────────────

resourceRouter.post('/purchase/:cardId', auth, async (req, res) => {
  try {
    const { cardId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user.purchasedResources.includes(cardId)) {
      user.purchasedResources.push(cardId);
      await user.save();
    }
    res.json({ message: 'Resource unlocked successfully', purchasedResources: user.purchasedResources });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = resourceRouter;
