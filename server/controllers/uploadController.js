import Template from '../models/Template.js';

const MAX_GLB_SIZE = parseInt(process.env.MAX_FILE_SIZE_GLB) || 20971520; // 20MB
const MAX_IMAGE_SIZE = parseInt(process.env.MAX_FILE_SIZE_IMAGE) || 5242880; // 5MB
const MIN_IMAGES = parseInt(process.env.MIN_IMAGES) || 36;
const MAX_IMAGES = parseInt(process.env.MAX_IMAGES) || 60;

// Upload GLB file
export const uploadGLB = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shopId = req.headers['x-shop-id'] || 'default-shop';

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (req.file.mimetype !== 'model/gltf-binary' && !req.file.originalname.endsWith('.glb')) {
      return res.status(400).json({ error: 'Invalid file type. Only GLB files are accepted' });
    }

    if (req.file.size > MAX_GLB_SIZE) {
      return res.status(400).json({
        error: `File size exceeds maximum of ${MAX_GLB_SIZE / 1024 / 1024}MB`
      });
    }

    const template = await Template.findOne({
      $or: [{ templateId: id }, { _id: id }],
      shopId
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.fileType !== 'glb') {
      return res.status(400).json({ error: 'This template is for images, not GLB' });
    }

    // Store file info
    template.glbFile = {
      fileId: `file_${Date.now()}`,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date()
    };

    await template.save();

    res.json({
      success: true,
      data: {
        templateId: template.templateId,
        glbFile: template.glbFile
      },
      message: 'GLB file uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Upload multiple images
export const uploadImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shopId = req.headers['x-shop-id'] || 'default-shop';

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    if (req.files.length < MIN_IMAGES) {
      return res.status(400).json({
        error: `Minimum ${MIN_IMAGES} images required. Got ${req.files.length}`
      });
    }

    if (req.files.length > MAX_IMAGES) {
      return res.status(400).json({
        error: `Maximum ${MAX_IMAGES} images allowed. Got ${req.files.length}`
      });
    }

    // Validate each file
    for (let file of req.files) {
      if (file.size > MAX_IMAGE_SIZE) {
        return res.status(400).json({
          error: `File ${file.originalname} exceeds maximum size of ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
        });
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
        return res.status(400).json({
          error: `Invalid file type for ${file.originalname}. Only JPG, PNG, and WebP are accepted`
        });
      }
    }

    const template = await Template.findOne({
      $or: [{ templateId: id }, { _id: id }],
      shopId
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.fileType !== 'images') {
      return res.status(400).json({ error: 'This template is for GLB, not images' });
    }

    // Store image files
    const imageFiles = req.files.map((file, index) => ({
      fileId: `file_${Date.now()}_${index}`,
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      displayOrder: index,
      uploadedAt: new Date()
    }));

    template.imageFiles = imageFiles;
    await template.save();

    res.json({
      success: true,
      data: {
        templateId: template.templateId,
        imageCount: imageFiles.length,
        imageFiles: imageFiles
      },
      message: `${imageFiles.length} images uploaded successfully`
    });
  } catch (error) {
    next(error);
  }
};

// Delete file from template
export const deleteFile = async (req, res, next) => {
  try {
    const { id, fileId } = req.params;
    const shopId = req.headers['x-shop-id'] || 'default-shop';

    const template = await Template.findOne({
      $or: [{ templateId: id }, { _id: id }],
      shopId
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.fileType === 'glb') {
      if (template.glbFile?.fileId === fileId) {
        template.glbFile = null;
      }
    } else {
      const initialCount = template.imageFiles.length;
      template.imageFiles = template.imageFiles.filter(img => img.fileId !== fileId);

      if (template.imageFiles.length > 0 && template.imageFiles.length < MIN_IMAGES) {
        template.imageFiles.length = initialCount;
        return res.status(400).json({
          error: `Cannot delete file. Minimum ${MIN_IMAGES} images required`
        });
      }
    }

    await template.save();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
