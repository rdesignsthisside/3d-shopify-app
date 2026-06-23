# 3D Shopify App - Template Manager

A powerful Shopify app that enables merchants to create and manage 3D (GLB) and image-based templates with easy embedding capabilities via Liquid shortcodes.

## Features

✨ **Core Features:**
- **Template Management**: Create, read, update, and delete templates
- **Dual File Type Support**:
  - **GLB Format**: Single 3D model (max 20MB)
  - **Images**: Multiple images (minimum 36, maximum 60)
- **Template Dashboard**: View all templates with metadata and quick actions
- **Liquid Integration**: Copy shortcodes to embed templates anywhere on the store
- **File Validation**: Automatic validation of file sizes and formats
- **Template Copying**: Duplicate existing templates with one click

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **File Storage**: Local storage (upgradeable to Shopify Files API or S3)
- **Authentication**: Shopify OAuth

## Project Structure

```
.
├── server/                  # Backend Express server
│   ├── index.js            # Server entry point
│   ├── middleware/          # Auth, error handling
│   ├── routes/              # API endpoints
│   ├── models/              # MongoDB schemas
│   ├── controllers/         # Business logic
│   └── utils/               # Helper functions
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Frontend utilities
│   │   └── App.jsx
│   └── vite.config.js
├── .env.example             # Environment variables template
├── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/rdesignsthisside/3d-shopify-app.git
cd 3d-shopify-app
```

2. Install dependencies:
```bash
npm install
cd client && npm install && cd ..
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Shopify credentials and MongoDB URI
```

4. Ensure MongoDB is running:
```bash
# If using local MongoDB
mongodb://localhost:27017/3d-shopify-app
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at:
- Frontend: `http://localhost:5173` (React dev server)
- Backend API: `http://localhost:3001`

## API Endpoints

### Templates
```
POST   /api/templates              # Create new template
GET    /api/templates              # List all templates
GET    /api/templates/:id          # Get template details
PUT    /api/templates/:id          # Update template
DELETE /api/templates/:id          # Delete template
POST   /api/templates/:id/copy     # Copy template
```

### File Upload
```
POST   /api/upload/templates/:id/glb      # Upload GLB file (single)
POST   /api/upload/templates/:id/images   # Upload images (multiple)
DELETE /api/upload/templates/:id/files/:fileId  # Delete file
```

## Usage Workflow

### 1. Create Template
```bash
curl -X POST http://localhost:3001/api/templates \
  -H "Content-Type: application/json" \
  -H "x-shop-id: myshop" \
  -d {
    "name": "Product Showcase",
    "fileType": "glb",
    "description": "3D model of our product"
  }
```

### 2. Upload Files

**For GLB:**
```bash
curl -X POST http://localhost:3001/api/upload/templates/template-id/glb \
  -F "file=@model.glb" \
  -H "x-shop-id: myshop"
```

**For Images:**
```bash
curl -X POST http://localhost:3001/api/upload/templates/template-id/images \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  ... (36-60 images total) \
  -H "x-shop-id: myshop"
```

### 3. Get Liquid Code
Each template automatically generates a Liquid shortcode:
```liquid
{% include 'shopify-template' id: 'template-id-here' %}
```

Or custom shortcode format:
```
[shopify-template id='template-id-here']
```

## File Constraints

| Constraint | GLB | Images |
|-----------|-----|--------|
| Max file size | 20 MB | 5 MB each |
| File count | 1 | 36-60 |
| Formats | .glb | .jpg, .png, .webp |

## Template Data Structure

```javascript
{
  templateId: "uuid",           // Unique identifier
  shopId: "store-id",
  name: "Template Name",
  description: "Description",
  fileType: "glb" | "images",
  status: "draft" | "published" | "archived",
  glbFile: { ... },             // For GLB templates
  imageFiles: [ ... ],          // For image templates
  liquidCode: "{% include 'shopify-template' id: '...' %}",
  shortCode: "[shopify-template id='...']",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

## Development

### Run tests
```bash
npm test
```

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/3d-shopify-app |
| PORT | Backend server port | 3001 |
| MAX_FILE_SIZE_GLB | Max GLB file size (bytes) | 20971520 (20MB) |
| MAX_FILE_SIZE_IMAGE | Max image file size (bytes) | 5242880 (5MB) |
| MIN_IMAGES | Minimum images per template | 36 |
| MAX_IMAGES | Maximum images per template | 60 |
| NODE_ENV | Environment | development |

## License

MIT
