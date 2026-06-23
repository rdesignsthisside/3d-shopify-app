import express from 'express';
import * as templateController from '../controllers/templateController.js';

const router = express.Router();

// Create template
router.post('/', templateController.createTemplate);

// Get all templates
router.get('/', templateController.getTemplates);

// Get single template
router.get('/:id', templateController.getTemplate);

// Update template
router.put('/:id', templateController.updateTemplate);

// Delete template
router.delete('/:id', templateController.deleteTemplate);

// Copy template
router.post('/:id/copy', templateController.copyTemplate);

export default router;
