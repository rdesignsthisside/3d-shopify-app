import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const templateSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true
    },
    shopId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    fileType: {
      type: String,
      enum: ['glb', 'images'],
      required: true
    },
    glbFile: {
      fileId: String,
      fileName: String,
      fileUrl: String,
      fileSize: Number,
      mimeType: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    },
    imageFiles: [
      {
        fileId: String,
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        mimeType: String,
        displayOrder: Number,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    liquidCode: {
      type: String,
      default: function() {
        return `{% include 'shopify-template' id: '${this.templateId}' %}`;
      }
    },
    shortCode: {
      type: String,
      default: function() {
        return `[shopify-template id='${this.templateId}']`;
      }
    },
    createdBy: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
);

// Virtual for image count
templateSchema.virtual('imageCount').get(function() {
  return this.fileType === 'images' ? (this.imageFiles?.length || 0) : 0;
});

// Index for faster queries
templateSchema.index({ shopId: 1, createdAt: -1 });
templateSchema.index({ shopId: 1, name: 'text' });

// Validation: Check image count for image type
templateSchema.pre('save', function(next) {
  if (this.fileType === 'images') {
    const imageCount = this.imageFiles?.length || 0;
    if (imageCount > 0 && imageCount < 36) {
      return next(new Error(`Minimum 36 images required. Got ${imageCount}`));
    }
    if (imageCount > 60) {
      return next(new Error(`Maximum 60 images allowed. Got ${imageCount}`));
    }
  }
  next();
});

export default mongoose.model('Template', templateSchema);
