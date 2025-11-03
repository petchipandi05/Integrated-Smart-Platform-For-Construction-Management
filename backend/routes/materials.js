const express = require('express');
const Project = require('../models/project');
const Material = require('../models/material');
const router = express.Router();

// Get All Materials for a Project
router.get('/:id/materials', async (req, res) => {
  try {
    const { id } = req.params;
    const materials = await Material.find({ projectId: id }).sort({ createdAt: -1 });
    const project = await Project.findById(id);
    res.status(200).json({
      materials,
      totalMaterialCost: project.totalMaterialCost,
      totalLaborCost: project.totalLaborCost,
      grandProjectCost: project.grandProjectCost,
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ message: 'Error fetching materials', error: error.message });
  }
});

// Create or Update Material Usage
router.post('/:id/materials/usage', async (req, res) => {
  try {
    const { id } = req.params;
    const { materialName, division, quantity, unit, description, date, usageId } = req.body;

    let material = await Material.findOne({ projectId: id, name: materialName });
    if (!material) {
      material = new Material({ projectId: id, name: materialName, usageInfo: [], purchaseInfo: [] });
    }

    if (usageId) {
      const usageIndex = material.usageInfo.findIndex(u => u._id.toString() === usageId);
      if (usageIndex !== -1) {
        material.usageInfo[usageIndex] = { division, quantity, unit, description, date };
      }
    } else {
      material.usageInfo.push({ division, quantity, unit, description, date });
    }

    await material.save();
    res.status(200).json(material);
  } catch (error) {
    console.error('Error adding/updating material usage:', error);
    res.status(500).json({ message: 'Error adding/updating material usage', error: error.message });
  }
});

// Create or Update Material Purchase
router.post('/:id/materials/purchase', async (req, res) => {
  try {
    const { id } = req.params;
    const { materialName, date, quantity, supplier, unitPrice, totalCost, deliveryNote, invoiceNumber, purchaseId } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    let material = await Material.findOne({ projectId: id, name: materialName });
    let oldTotalCost = 0;

    if (purchaseId) {
      const existingMaterial = await Material.findOne({ projectId: id, 'purchaseInfo._id': purchaseId });
      if (!existingMaterial) {
        return res.status(404).json({ message: 'Purchase entry not found' });
      }
      const purchaseIndex = existingMaterial.purchaseInfo.findIndex(p => p._id.toString() === purchaseId);
      oldTotalCost = existingMaterial.purchaseInfo[purchaseIndex].totalCost;

      if (material) {
        material.purchaseInfo[purchaseIndex] = { date, quantity, supplier, unitPrice, totalCost, deliveryNote, invoiceNumber };
      }
    } else {
      if (!material) {
        material = new Material({ projectId: id, name: materialName, usageInfo: [], purchaseInfo: [] });
        project.materials.push(material._id);
      }
      material.purchaseInfo.push({ date, quantity, supplier, unitPrice, totalCost, deliveryNote, invoiceNumber });
    }

    await material.save();

    project.totalMaterialCost = project.totalMaterialCost - oldTotalCost + totalCost;
    project.grandProjectCost = project.totalLaborCost + project.totalMaterialCost;
    await project.save();

    res.status(200).json(material);
  } catch (error) {
    console.error('Error adding/updating material purchase:', error);
    res.status(500).json({ message: 'Error adding/updating material purchase', error: error.message });
  }
});

// Delete Material Usage
router.delete('/:id/materials/usage/:usageId', async (req, res) => {
  try {
    const { id, usageId } = req.params;
    const material = await Material.findOne({ projectId: id, 'usageInfo._id': usageId });
    if (!material) {
      return res.status(404).json({ message: 'Material or usage entry not found' });
    }

    material.usageInfo = material.usageInfo.filter(u => u._id.toString() !== usageId);
    await material.save();
    res.status(200).json(material);
  } catch (error) {
    console.error('Error deleting material usage:', error);
    res.status(500).json({ message: 'Error deleting material usage', error: error.message });
  }
});

// Delete Material Purchase
router.delete('/:id/materials/purchase/:purchaseId', async (req, res) => {
  try {
    const { id, purchaseId } = req.params;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const material = await Material.findOne({ projectId: id, 'purchaseInfo._id': purchaseId });
    if (!material) {
      return res.status(404).json({ message: 'Material or purchase entry not found' });
    }

    const purchaseToDelete = material.purchaseInfo.find(p => p._id.toString() === purchaseId);
    const deletedTotalCost = purchaseToDelete.totalCost;

    material.purchaseInfo = material.purchaseInfo.filter(p => p._id.toString() !== purchaseId);
    await material.save();

    project.totalMaterialCost -= deletedTotalCost;
    project.grandProjectCost = project.totalLaborCost + project.totalMaterialCost;
    await project.save();

    res.status(200).json(material);
  } catch (error) {
    console.error('Error deleting material purchase:', error);
    res.status(500).json({ message: 'Error deleting material purchase', error: error.message });
  }
});

module.exports = router;