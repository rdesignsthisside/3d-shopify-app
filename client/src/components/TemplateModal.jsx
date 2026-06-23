import { useState } from 'react';
import { X } from 'react-feather';
import { FileUpload } from './FileUpload';
import axios from 'axios';

export function TemplateModal({ template, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    status: template?.status || 'draft'
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilesSelected = async (files) => {
    if (!template?._id) {
      alert('Please save template first');
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      const fileKey = template.fileType === 'glb' ? 'file' : 'files';
      
      if (template.fileType === 'glb') {
        formDataUpload.append(fileKey, files[0]);
      } else {
        files.forEach(file => formDataUpload.append(fileKey, file));
      }

      const endpoint = `/api/upload/templates/${template._id}/${template.fileType === 'glb' ? 'glb' : 'images'}`;
      
      const response = await axios.post(endpoint, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      onSave();
      alert('Files uploaded successfully!');
    } catch (error) {
      alert(`Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Template Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Product Showcase"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your template..."
              rows="3"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {template && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {template.fileType === 'glb' ? 'Upload GLB File (Max 20MB)' : 'Upload Images (36-60 images)'}
              </label>
              <FileUpload
                onFilesSelected={handleFilesSelected}
                maxFiles={template.fileType === 'glb' ? 1 : 60}
                minFiles={template.fileType === 'glb' ? 1 : 36}
                accept={template.fileType === 'glb' ? { 'model/gltf-binary': ['.glb'] } : { 'image/*': ['.jpg', '.png', '.webp'] }}
                maxSize={template.fileType === 'glb' ? 20 : 5}
              />

              {uploading && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Uploading...</span>
                    <span className="text-sm text-gray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => onSave(formData)} className="btn-primary">
            {template ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
