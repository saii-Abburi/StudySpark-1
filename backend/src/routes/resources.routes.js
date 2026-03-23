const express = require('express');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/role');
const ResourceFolder = require('../models/ResourceFolder');
const ResourceItem = require('../models/ResourceItem');
const { cloudinary, upload } = require('../utils/cloudinary');

const resourceRouter = express.Router();

// =============================================
// PUBLIC / STUDENT ROUTES
// =============================================

/**
 * GET /resources/folders?stream=engineering&subject=physics
 * Returns all folders for a given stream+subject
 */
resourceRouter.get('/folders', auth, async (req, res) => {
  try {
    const { stream, subject } = req.query;
    if (!stream || !subject) {
      return res.status(400).json({ error: 'stream and subject are required' });
    }
    const folders = await ResourceFolder.find({ stream, subject }).sort({ order: 1, createdAt: 1 });
    res.json({ folders });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /resources/items/:folderId
 * Returns all items inside a folder
 */
resourceRouter.get('/items/:folderId', auth, async (req, res) => {
  try {
    const items = await ResourceItem.find({ folderId: req.params.folderId }).sort({ order: 1, createdAt: 1 });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// INSTRUCTOR ONLY ROUTES
// =============================================

/**
 * POST /resources/instructor/folders
 * Create a new folder
 */
resourceRouter.post('/instructor/folders', auth, allowRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { stream, subject, name } = req.body;
    if (!stream || !subject || !name) {
      return res.status(400).json({ error: 'stream, subject, and name are required' });
    }
    const folder = await ResourceFolder.create({
      stream: stream.toLowerCase(),
      subject: subject.toLowerCase(),
      name: name.trim(),
      createdBy: req.user._id,
    });
    res.status(201).json({ folder });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /resources/instructor/folders/:id
 * Rename / edit a folder
 */
resourceRouter.put('/instructor/folders/:id', auth, allowRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const folder = await ResourceFolder.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true }
    );
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    res.json({ folder });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /resources/instructor/folders/:id
 * Delete a folder and all its items from Cloudinary
 */
resourceRouter.delete('/instructor/folders/:id', auth, allowRoles('instructor', 'admin'), async (req, res) => {
  try {
    const folder = await ResourceFolder.findById(req.params.id);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });

    // Delete all items inside first
    const items = await ResourceItem.find({ folderId: folder._id });
    for (const item of items) {
      if (item.cloudinaryId) {
        await cloudinary.uploader.destroy(item.cloudinaryId, { resource_type: 'raw' });
      }
    }
    await ResourceItem.deleteMany({ folderId: folder._id });
    await folder.deleteOne();

    res.json({ message: 'Folder and its contents deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /resources/instructor/items
 * Upload a file to Cloudinary and save the item to a folder
 */
resourceRouter.post('/instructor/items', auth, allowRoles('instructor', 'admin'), upload.single('file'), async (req, res) => {
  try {
    const { folderId, title, type, url } = req.body;

    if (!folderId || !title) {
      return res.status(400).json({ error: 'folderId and title are required' });
    }

    const folder = await ResourceFolder.findById(folderId);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });

    let itemUrl = url;
    let cloudinaryId = null;

    if (req.file) {
      // Cloudinary upload via multer
      itemUrl = req.file.path;
      cloudinaryId = req.file.filename;
    }

    if (!itemUrl) {
      return res.status(400).json({ error: 'Either upload a file or provide a URL' });
    }

    const item = await ResourceItem.create({
      folderId,
      title: title.trim(),
      type: type || 'pdf',
      url: itemUrl,
      cloudinaryId,
      uploadedBy: req.user._id,
    });

    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

/**
 * DELETE /resources/instructor/items/:id
 * Delete an item and remove from Cloudinary
 */
resourceRouter.delete('/instructor/items/:id', auth, allowRoles('instructor', 'admin'), async (req, res) => {
  try {
    const item = await ResourceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (item.cloudinaryId) {
      await cloudinary.uploader.destroy(item.cloudinaryId, { resource_type: 'raw' });
    }

    await item.deleteOne();
    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = resourceRouter;
