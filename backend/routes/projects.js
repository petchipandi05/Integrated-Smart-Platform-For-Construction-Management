const express = require('express');
const User = require('../models/user');
const Project = require('../models/project');
const Labor=require("../models/labor")
const Material=require("../models/material")
const Progress = require('../models/progress');
const { upload, cloudinary } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Create a New Project with Image Upload
router.post('/', upload.single('projectImage'), async (req, res) => {
  try {
    const {
      projectName,
      location,
      cost,
      startingDate,
      deadline,
      totalLandArea,
      typeOfConstruction,
      divisions,
      email,
    } = req.body;

    const client = await User.findOne({ email });
    if (!client) {
      return res.status(404).json({ message: 'Client not found with this email' });
    }

    let imageUrl = null;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'projects' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }

    const newProject = new Project({
      projectName,
      location,
      cost,
      startingDate,
      deadline,
      totalLandArea,
      typeOfConstruction,
      divisions: JSON.parse(divisions),
      clientId: client._id,
      imageUrl,
    });

    const savedProject = await newProject.save();

    client.projects.push(savedProject._id);
    await client.save();

    res.status(201).json({ message: 'Project created successfully', project: savedProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get All Projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('clientId', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// Get Project Metrics
router.get('/metrics', async (req, res) => {
  try {
    const ongoingProjects = await Project.countDocuments({ status: 'ongoing' });
    const completedProjects = await Project.countDocuments({ status: 'finished' });
    const totalProjects = await Project.countDocuments();

    const metrics = {
      ongoingProjects,
      completedProjects,
      totalProjects,
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching project metrics:', error);
    res.status(500).json({ message: 'Error fetching project metrics', error: error.message });
  }
});

// Get Project Details by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id).populate('clientId', 'name email phone');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({
      project: {
        id: project._id,
        name: project.projectName,
        location: project.location,
        startDate: project.startingDate,
        deadline: project.deadline,
        projectType: project.typeOfConstruction,
        status: project.status,
        projectCost: project.cost,
        divisions: project.divisions,
        totalLandArea: project.totalLandArea,
        imageUrl: project.imageUrl,
        totalLaborCost: project.totalLaborCost,
        totalMaterialCost: project.totalMaterialCost,
        grandProjectCost: project.grandProjectCost,
        user: {
          name: project.clientId.name,
          email: project.clientId.email,
          phone: project.clientId.phone,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ message: 'Error fetching project details', error: error.message });
  }
});

// Update Project Status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project status updated', project });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ message: 'Error updating project status', error: error.message });
  }
});

// Update a Project
router.patch('/:id', upload.single('projectImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { projectName, location, cost, startingDate, deadline, totalLandArea, typeOfConstruction, divisions, email } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const client = await User.findOne({ email });
    if (!client) return res.status(404).json({ message: 'Client not found with this email' });

    project.projectName = projectName || project.projectName;
    project.location = location || project.location;
    project.cost = cost || project.cost;
    project.startingDate = startingDate || project.startingDate;
    project.deadline = deadline || project.deadline;
    project.totalLandArea = totalLandArea || project.totalLandArea;
    project.typeOfConstruction = typeOfConstruction || project.typeOfConstruction;
    project.divisions = divisions ? JSON.parse(divisions) : project.divisions;
    project.clientId = client._id;

    if (req.file) {
      if (project.imageUrl) {
        const publicId = project.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`projects/${publicId}`);
      }
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'projects' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      project.imageUrl = result.secure_url;
    }

    const updatedProject = await project.save();
    res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
});

// Delete a Project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the project
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete project image from Cloudinary if it exists
    if (project.imageUrl) {
      const publicId = project.imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`projects/${publicId}`);
    }

    // Find all progress documents associated with the project
    const progressDocs = await Progress.find({ projectId: id });

    // Delete progress images/videos from Cloudinary
    for (const progress of progressDocs) {
      if (progress.imageUrl) {
        const publicId = progress.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`progress/${publicId}`); // Adjust folder path as needed
      }
      if (progress.videoUrl) {
        const videoPublicId = progress.videoUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`progress/${videoPublicId}`, { resource_type: 'video' }); // Specify resource_type for videos
      }
    }

    // Delete related documents from the database
    await User.updateOne(
      { _id: project.clientId },
      { $pull: { projects: id } }
    );
    await Labor.deleteMany({ projectId: id });
    await Material.deleteMany({ projectId: id });
    await Progress.deleteMany({ projectId: id });

    res.status(200).json({ message: 'Project and associated assets deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});
// Get all projects for a client
router.get('/client/projects', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.query;
    if (!clientId) return res.status(400).json({ message: 'Client ID required' });

    if (req.user.id !== clientId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const projects = await Project.find({ clientId })
      .populate({
        path: 'progressUpdates',
        select: 'progress viewed',
      }); // Removed limit: 1 to get all progress updates

    // Calculate unviewed count for each project
    const projectsWithUnviewed = projects.map(project => ({
      ...project.toObject(),
      unviewedCount: project.progressUpdates.filter(p => !p.viewed).length,
    }));

    // Total unviewed count across all projects
    const totalUnviewed = projectsWithUnviewed.reduce((sum, project) => sum + project.unviewedCount, 0);

    res.status(200).json({ projects: projectsWithUnviewed, totalUnviewed });
  } catch (error) {
    console.error('Error fetching client projects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;