import express from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/uploadController.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['model/gltf-binary', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.glb')) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  }
});

// Upload GLB file
router.post('/templates/:id/glb', upload.single('file'), uploadController.uploadGLB);

// Upload multiple images
router.post('/templates/:id/images', upload.array('files', 60), uploadController.uploadImages);

// Delete file
router.delete('/templates/:id/files/:fileId', uploadController.deleteFile);

export default router;
