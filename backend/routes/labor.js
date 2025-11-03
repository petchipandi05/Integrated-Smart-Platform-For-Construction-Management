const express = require('express');
const Project = require('../models/project');
const Labor = require('../models/labor');
const router = express.Router();

// Get All Labor Records for a Project
router.get('/:id/labor', async (req, res) => {
  try {
    const { id } = req.params;
    const laborRecords = await Labor.find({ projectId: id }).sort({ date: -1 });
    const project = await Project.findById(id);

    res.status(200).json({
      laborRecords,
      totalLaborCost: project.totalLaborCost,
      totalMaterialCost: project.totalMaterialCost,
      grandProjectCost: project.grandProjectCost,
    });
  } catch (error) {
    console.error('Error fetching labor records:', error);
    res.status(500).json({ message: 'Error fetching labor records', error: error.message });
  }
});

// Create a New Labor Record
router.post('/:id/labor', async (req, res) => {
  try {
    const { id } = req.params;
    const { laborType, numberOfWorkers, date, rate, description } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const totalWage = rate * numberOfWorkers;
    const newLaborRecord = new Labor({
      projectId: id,
      laborType,
      numberOfWorkers,
      date,
      rate,
      description,
      totalWage,
    });

    const savedLaborRecord = await newLaborRecord.save();

    project.laborRecords.push(savedLaborRecord._id);
    project.totalLaborCost += totalWage;
    project.grandProjectCost = project.totalLaborCost + project.totalMaterialCost;
    await project.save();

    res.status(201).json({ message: 'Labor record created successfully', labor: savedLaborRecord });
  } catch (error) {
    console.error('Error creating labor record:', error);
    res.status(500).json({ message: 'Error creating labor record', error: error.message });
  }
});

// Update a Labor Record
router.put('/:id/labor/:laborId', async (req, res) => {
  try {
    const { id, laborId } = req.params;
    const { laborType, numberOfWorkers, date, rate, description } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const laborRecord = await Labor.findById(laborId);
    if (!laborRecord || laborRecord.projectId.toString() !== id) {
      return res.status(404).json({ message: 'Labor record not found' });
    }

    const oldTotalWage = laborRecord.totalWage;
    const newTotalWage = rate * numberOfWorkers;

    laborRecord.laborType = laborType || laborRecord.laborType;
    laborRecord.numberOfWorkers = numberOfWorkers || laborRecord.numberOfWorkers;
    laborRecord.date = date || laborRecord.date;
    laborRecord.rate = rate || laborRecord.rate;
    laborRecord.description = description || laborRecord.description;
    laborRecord.totalWage = newTotalWage;

    const updatedLaborRecord = await laborRecord.save();

    project.totalLaborCost = project.totalLaborCost - oldTotalWage + newTotalWage;
    project.grandProjectCost = project.totalLaborCost + project.totalMaterialCost;
    await project.save();

    res.status(200).json({ message: 'Labor record updated successfully', labor: updatedLaborRecord });
  } catch (error) {
    console.error('Error updating labor record:', error);
    res.status(500).json({ message: 'Error updating labor record', error: error.message });
  }
});

// Delete a Labor Record
router.delete('/:id/labor/:laborId', async (req, res) => {
  try {
    const { id, laborId } = req.params;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const laborRecord = await Labor.findById(laborId);
    if (!laborRecord || laborRecord.projectId.toString() !== id) {
      return res.status(404).json({ message: 'Labor record not found' });
    }

    const deletedTotalWage = laborRecord.totalWage;

    await Labor.deleteOne({ _id: laborId });

    project.laborRecords.pull(laborId);
    project.totalLaborCost -= deletedTotalWage;
    project.grandProjectCost = project.totalLaborCost + project.totalMaterialCost;
    await project.save();

    res.status(200).json({ message: 'Labor record deleted successfully' });
  } catch (error) {
    console.error('Error deleting labor record:', error);
    res.status(500).json({ message: 'Error deleting labor record', error: error.message });
  }
});

module.exports = router;