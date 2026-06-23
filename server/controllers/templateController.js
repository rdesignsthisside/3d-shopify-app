import Template from '../models/Template.js';
import { v4 as uuidv4 } from 'uuid';

// Create template
export const createTemplate = async (req, res, next) => {
  try {
    const { name, description, fileType } = req.body;
    const shopId = req.headers['x-shop-id'] || 'default-shop';

    if (!name || !fileType) {
      return res.status(400).json({ error: 'Name and fileType are required' });
    }

    if (!['glb', 'images'].includes(fileType)) {
      return res.status(400).json({ error: 'FileType must be either glb or images' });
    }

    const template = new Template({
      shopId,
      name,
      description,
      fileType,
      createdBy: req.headers['x-user-id'] || 'anonymous'
    });

    await template.save();

    res.status(201).json({
      success: true,
      data: template,
      message: `Template created with ID: ${template.templateId}`
    });
  } catch (error) {
    next(error);
  }
};

// Get all templates for a shop
export const getTemplates = async (req, res, next) => {
  try {
    const shopId = req.headers['x-shop-id'] || 'default-shop';
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const skip = (page - 1) * limit;

    const templates = await Template.find({ shopId })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Template.countDocuments({ shopId });

    res.json({
      success: true,
      data: templates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single template
export const getTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shopId = req.headers['x-shop-id'] || 'default-shop';

    const template = await Template.findOne({
      $or: [{ templateId: id }, { _id: id }],
      shopId
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    next(error);
  }
};

// Update template
export const updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shopId = req.headers['x-shop-id'] || 'default-shop';
    const { name, description, status } = req.body;

    const template = await Template.findOneAndUpdate(
      { $or: [{ templateId: id }, { _id: id }], shopId },
      { name, description, status },
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      success: true,
      data: template,
      message: 'Template updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete template
export const deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shopId = req.headers['x-shop-id'] || 'default-shop';

    const template = await Template.findOneAndDelete({
      $or: [{ templateId: id }, { _id: id }],
      shopId
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      success: true,
      data: { templateId: template.templateId },
      message: 'Template deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Copy template
export const copyTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shopId = req.headers['x-shop-id'] || 'default-shop';

    const original = await Template.findOne({
      $or: [{ templateId: id }, { _id: id }],
      shopId
    });

    if (!original) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const templateCopy = new Template({
      ...original.toObject(),
      _id: undefined,
      templateId: uuidv4(),
      name: `${original.name} (Copy)`,
      status: 'draft',
      createdAt: undefined,
      updatedAt: undefined
    });

    await templateCopy.save();

    res.status(201).json({
      success: true,
      data: templateCopy,
      message: `Template copied with new ID: ${templateCopy.templateId}`
    });
  } catch (error) {
    next(error);
  }
};
