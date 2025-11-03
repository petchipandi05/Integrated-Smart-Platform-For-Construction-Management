const express = require('express');
const clientrequestform = require('../models/clientsiderequestform');
const router = express.Router();

// Client Request Form Submission
router.post('/', async (req, res) => {
  try {
    const projectData = req.body;
    const newProject = new clientrequestform(projectData);
    await newProject.save();
    res.status(201).json({ message: 'Project submitted successfully', project: newProject });
  } catch (error) {
    console.error('Error submitting project:', error);
    res.status(400).json({ message: 'Error submitting project', error: error.message });
  }
});

// Get All Client Requests
router.get('/registrations', async (req, res) => {
  try {
    const projects = await clientrequestform.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// Verify Client Request
router.patch('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await clientrequestform.findByIdAndUpdate(
      id,
      { verified: true },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project marked as verified', project });
  } catch (error) {
    console.error('Error verifying project:', error);
    res.status(500).json({ message: 'Error verifying project', error: error.message });
  }
});

module.exports = router;