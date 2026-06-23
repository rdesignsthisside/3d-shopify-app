import { useState } from 'react';
import { ChevronRight, FileText, Image as ImageIcon } from 'react-feather';
import axios from 'axios';
import { FileUpload } from '../components/FileUpload';

export function CreateTemplate() {
  const [step, setStep] = useState(1);
  const [templateName, setTemplateName] = useState('');
  const [fileType, setFileType] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [createdTemplate, setCreatedTemplate] = useState(null);

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    try {
      const response = await axios.post('/api/templates', {
        name: templateName,
        fileType: fileType,
        description: `${fileType === 'glb' ? '3D Model' : 'Image'} Template`,
        status: 'draft'
      }, {
        headers: { 'x-shop-id': 'default-shop' }
      });

      setCreatedTemplate(response.data.data);
      setStep(3);
    } catch (error) {
      alert(`Failed to create template: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleFileUpload = async (files) => {
    if (!createdTemplate) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      const fileKey = fileType === 'glb' ? 'file' : 'files';

      if (fileType === 'glb') {
        formData.append(fileKey, files[0]);
      } else {
        files.forEach(file => formData.append(fileKey, file));
      }

      const endpoint = `/api/upload/templates/${createdTemplate._id}/${fileType === 'glb' ? 'glb' : 'images'}`;

      await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      alert('Files uploaded successfully!');
      setStep(4);
    } catch (error) {
      alert(`Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                    step >= s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition ${
                      step > s ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm mt-4 text-gray-600">
            <span>Template Info</span>
            <span>File Type</span>
            <span>Upload Files</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Step 1: Template Name */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Template</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Product Showcase, 360 View"
                className="input-field mb-6"
              />
              <button
                onClick={() => {
                  if (templateName.trim()) setStep(2);
                  else alert('Please enter a template name');
                }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: File Type Selection */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select File Type</h2>
            <p className="text-gray-600 mb-6">Choose how you want to display your content</p>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div
                onClick={() => setFileType('glb')}
                className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                  fileType === 'glb'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FileText className={`mb-4 ${
                  fileType === 'glb' ? 'text-blue-600' : 'text-gray-600'
                }`} size={40} />
                <h3 className="font-semibold text-gray-900">3D Model (GLB)</h3>
                <p className="text-sm text-gray-600 mt-2">Single GLB file up to 20MB</p>
              </div>
              <div
                onClick={() => setFileType('images')}
                className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                  fileType === 'images'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <ImageIcon className={`mb-4 ${
                  fileType === 'images' ? 'text-blue-600' : 'text-gray-600'
                }`} size={40} />
                <h3 className="font-semibold text-gray-900">Image Gallery</h3>
                <p className="text-sm text-gray-600 mt-2">36-60 images (5MB each)</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                Back
              </button>
              <button
                onClick={handleCreateTemplate}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Create <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Upload Files */}
        {step === 3 && createdTemplate && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {fileType === 'glb' ? 'Upload 3D Model' : 'Upload Images'}
            </h2>
            <p className="text-gray-600 mb-6">
              {fileType === 'glb'
                ? 'Upload your GLB file (maximum 20MB)'
                : 'Upload 36-60 images (5MB each)'}
            </p>
            <FileUpload
              onFilesSelected={handleFileUpload}
              maxFiles={fileType === 'glb' ? 1 : 60}
              minFiles={fileType === 'glb' ? 1 : 36}
              accept={fileType === 'glb' ? { 'model/gltf-binary': ['.glb'] } : { 'image/*': ['.jpg', '.png', '.webp'] }}
              maxSize={fileType === 'glb' ? 20 : 5}
            />
            {uploading && uploadProgress && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">Uploading...</span>
                  <span className="text-sm text-gray-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && createdTemplate && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✓</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Template Created!</h2>
            <p className="text-gray-600 mb-6">
              Your template is ready to use. Copy the Liquid code below to embed it on your store.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm text-gray-600 mb-2">Liquid Code:</p>
              <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm overflow-auto">
                {`{% include 'shopify-template' id: '${createdTemplate.templateId}' %}`}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`{% include 'shopify-template' id: '${createdTemplate.templateId}' %}`);
                  alert('Copied to clipboard!');
                }}
                className="btn-secondary mt-3 text-sm"
              >
                Copy Code
              </button>
            </div>
            <a href="/" className="btn-primary inline-block">
              Back to Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
