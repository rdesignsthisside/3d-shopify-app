import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, AlertCircle } from 'react-feather';
import { TemplateTable } from '../components/TemplateTable';
import { TemplateModal } from '../components/TemplateModal';

export function Dashboard() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/templates', {
        headers: { 'x-shop-id': 'default-shop' }
      });
      setTemplates(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCreatingTemplate(true);
    setModalOpen(true);
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setCreatingTemplate(false);
    setModalOpen(true);
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await axios.delete(`/api/templates/${templateId}`, {
        headers: { 'x-shop-id': 'default-shop' }
      });
      fetchTemplates();
    } catch (err) {
      alert('Failed to delete template');
    }
  };

  const handleCopy = async (template) => {
    try {
      await axios.post(`/api/templates/${template._id}/copy`, {}, {
        headers: { 'x-shop-id': 'default-shop' }
      });
      fetchTemplates();
      alert('Template copied successfully!');
    } catch (err) {
      alert('Failed to copy template');
    }
  };

  const handleSaveTemplate = async (formData) => {
    try {
      if (creatingTemplate) {
        await axios.post('/api/templates', {
          name: formData.name || 'New Template',
          description: formData.description,
          fileType: 'glb', // Default to GLB, can be changed in next step
          status: 'draft'
        }, {
          headers: { 'x-shop-id': 'default-shop' }
        });
      } else if (selectedTemplate) {
        await axios.put(`/api/templates/${selectedTemplate._id}`, formData, {
          headers: { 'x-shop-id': 'default-shop' }
        });
      }
      setModalOpen(false);
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (err) {
      alert('Failed to save template');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">3D Template Manager</h1>
              <p className="text-gray-600 mt-1">Create and manage your 3D models and image templates</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Create Template
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
            <p className="text-gray-600 mt-4">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900">No templates yet</h3>
            <p className="text-gray-600 mt-1">Create your first template to get started</p>
            <button
              onClick={handleCreateNew}
              className="btn-primary mt-4"
            >
              Create Your First Template
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <TemplateTable
              templates={templates}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCopy={handleCopy}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <TemplateModal
          template={creatingTemplate ? null : selectedTemplate}
          onClose={() => {
            setModalOpen(false);
            setSelectedTemplate(null);
          }}
          onSave={handleSaveTemplate}
        />
      )}
    </div>
  );
}
