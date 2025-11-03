const express = require('express');
const nodemailer = require('nodemailer');
const Project = require('../models/project');
const Progress = require('../models/progress');
const { upload, cloudinary } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
const dotenv=require('dotenv')
dotenv.config();
const mongoose = require('mongoose');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});
// Create Progress
router.post('/:id/progress', upload.array('media', 10), async (req, res) => {
  try {
    console.log();
    const { id } = req.params;
    const { division, progress, description } = req.body;

    if (!division || !progress || !description) {
      return res.status(400).json({ message: 'Division, progress, and description are required' });
    }

    const project = await Project.findById(id).populate('clientId', 'email name');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.clientId || !project.clientId.email) {
      return res.status(400).json({ message: 'Client email not found' });
    }

    const mediaUploads = req.files && req.files.length > 0 ? await Promise.all(
      req.files.map(file =>
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'progress',
              resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve({
                url: result.secure_url,
                type: file.mimetype.startsWith('video/') ? 'video' : 'image',
              });
            }
          );
          uploadStream.end(file.buffer);
        })
      )
    ) : [];

    const progressUpdate = new Progress({
      projectId: id,
      division,
      progress: parseInt(progress),
      media: mediaUploads,
      description,
    });

    await progressUpdate.save();
    project.progressUpdates.push(progressUpdate._id);
    await project.save();

    const mailOptions = {
      from: 'petchipandi05@gmail.com',
      to: project.clientId.email,
      subject: 'New Progress Update for Your Project',
      text: `Dear ${project.clientId.name || 'Client'},\n\nA new progress update has been posted for your project "${project.projectName}" by the contractor. Division: ${division}, Progress: ${progress}%, Description: ${description}.\n\nPlease log in to view the details.\n\nBest,\nThe BuildTrue Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json(progressUpdate);
  } catch (error) {
    console.error('Error creating progress:', error.stack);
    res.status(500).json({ message: 'Error creating progress', error: error.message });
  }
});

// Get All Progress Updates for a Project
router.get('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (req.user.role !== 'Admin' && req.user.id !== project.clientId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const progressUpdates = await Progress.find({ projectId: id }).sort({ dateUpdated: -1 });
    const unviewedCount = req.user.role === 'Client' ? progressUpdates.filter(p => !p.viewed).length : 0;
    console.log('Progress Fetched:', { id, progressUpdates: progressUpdates.length, unviewedCount });
    res.status(200).json({ progressUpdates, unviewedCount });
  } catch (error) {
    console.error('Error fetching progress updates:', error.stack);
    res.status(500).json({ message: 'Error fetching progress updates', error: error.message });
  }
});

// Get Specific Progress Update by ID
router.get('/progress/:progressId', authenticateToken, async (req, res) => {
  try {
    const { progressId } = req.params;
    const progress = await Progress.findById(progressId);
    if (!progress) return res.status(404).json({ message: 'Progress update not found' });
    res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching progress details:', error);
    res.status(500).json({ message: 'Error fetching progress details', error: error.message });
  }
});

// Update Progress
router.put('/:id/progress/:progressId', authenticateToken, upload.array('media', 10), async (req, res) => {
  try {
    const { id, progressId } = req.params;
    const { division, progress, description } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const progressUpdate = await Progress.findById(progressId);
    if (!progressUpdate || progressUpdate.projectId.toString() !== id) {
      return res.status(404).json({ message: 'Progress update not found' });
    }

    if (req.files.length > 0 && progressUpdate.media.length > 0) {
      await Promise.all(
        progressUpdate.media.map(media => {
          const publicId = media.url.split('/').pop().split('.')[0];
          const resourceType = media.type === 'video' ? 'video' : 'image';
          return cloudinary.uploader.destroy(`progress/${publicId}`, { resource_type: resourceType });
        })
      );
    }

    const mediaUploads = req.files.length > 0 ? await Promise.all(
      req.files.map(file =>
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'progress',
              resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve({
                url: result.secure_url,
                type: file.mimetype.startsWith('video/') ? 'video' : 'image',
              });
            }
          );
          uploadStream.end(file.buffer);
        })
      )
    ) : progressUpdate.media;

    progressUpdate.division = division || progressUpdate.division;
    progressUpdate.progress = progress || progressUpdate.progress;
    progressUpdate.media = mediaUploads;
    progressUpdate.description = description || progressUpdate.description;
    progressUpdate.dateUpdated = Date.now();

    await progressUpdate.save();
    res.status(200).json(progressUpdate);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Error updating progress', error: error.message });
  }
});

// Delete Progress
router.delete('/:id/progress/:progressId', authenticateToken, async (req, res) => {
  try {
    const { id, progressId } = req.params;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const progressUpdate = await Progress.findById(progressId);
    if (!progressUpdate || progressUpdate.projectId.toString() !== id) {
      return res.status(404).json({ message: 'Progress update not found' });
    }

    if (progressUpdate.media.length > 0) {
      await Promise.all(
        progressUpdate.media.map(media => {
          const publicId = media.url.split('/').pop().split('.')[0];
          const resourceType = media.type === 'video' ? 'video' : 'image';
          return cloudinary.uploader.destroy(`progress/${publicId}`, { resource_type: resourceType });
        })
      );
    }

    await Progress.deleteOne({ _id: progressId });
    project.progressUpdates = project.progressUpdates.filter(p => p.toString() !== progressId);
    await project.save();

    res.status(200).json({ message: 'Progress update deleted' });
  } catch (error) {
    console.error('Error deleting progress:', error);
    res.status(500).json({ message: 'Error deleting progress', error: error.message });
  }
});

// Add Message to Progress Update
router.post('/progress/:progressId/messages', authenticateToken, async (req, res) => {
  try {
    const { progressId } = req.params;
    const { text } = req.body;

    const progress = await Progress.findById(progressId);
    if (!progress) {
      return res.status(404).json({ message: 'Progress update not found' });
    }

    const newMessage = {
      senderId: req.user.id,
      sender: { text: req.user.role },
      text,
      timestamp: new Date(),
    };

    progress.messages.push(newMessage);
    await progress.save();

    res.status(200).json(progress);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Error adding message', error: error.message });
  }
});

// Mark Progress as Viewed
router.post('/progress/:progressId/view', authenticateToken, async (req, res) => {
  try {
    const { progressId } = req.params;
    const progress = await Progress.findById(progressId);
    if (!progress) return res.status(404).json({ message: 'Progress update not found' });

    if (req.user.role === 'Client' && !progress.viewed) {
      progress.viewed = true;
      await progress.save();
    }

    res.status(200).json({ message: 'Progress marked as viewed', progress });
  } catch (error) {
    console.error('Error marking progress as viewed:', error);
    res.status(500).json({ message: 'Error marking progress as viewed', error: error.message });
  }
});

// Trigger Email Notification
router.post('/:id/progress/:progressId/notify', async (req, res) => {
  try {
    const { id, progressId } = req.params;
    const project = await Project.findById(id).populate('clientId', 'email name');
    const progress = await Progress.findById(progressId);

    if (!project || !progress) return res.status(404).json({ message: 'Project or progress not found' });

    const mailOptions = {
      from: 'petchipandi05@gmail.com',
      to: project.clientId.email,
      subject: 'New Progress Update for Your Project',
      text: `Dear ${project.clientId.name},\n\nA new progress update has been posted for your project "${project.projectName}" by the contractor. Division: ${progress.division}, Progress: ${progress.progress}%, Description: ${progress.description}.\n\nPlease log in to view the details.\n\nBest,\nThe BuildTrue Team`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
});

module.exports = router;