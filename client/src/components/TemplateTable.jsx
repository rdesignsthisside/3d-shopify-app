import { useState } from 'react';
import { Edit2, Trash2, Copy, Download } from 'react-feather';

export function TemplateTable({ templates, onEdit, onDelete, onCopy }) {
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (templateId) => {
    const code = `{% include 'shopify-template' id: '${templateId}' %}`;
    navigator.clipboard.writeText(code);
    setCopiedId(templateId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();
  const formatTime = (date) => new Date(date).toLocaleTimeString();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Template Name</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Template ID</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Last Modified</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template._id} className="border-b hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium text-gray-900">{template.name}</td>
              <td className="px-4 py-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  template.fileType === 'glb'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {template.fileType === 'glb' ? '3D Model' : 'Images'}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600">
                {template.templateId.substring(0, 8)}...
              </td>
              <td className="px-4 py-3 text-gray-600">
                <div className="text-xs">{formatDate(template.updatedAt)}</div>
                <div className="text-xs text-gray-500">{formatTime(template.updatedAt)}</div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  template.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : template.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => onEdit(template)}
                    className="p-2 hover:bg-blue-100 rounded transition text-blue-600"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => copyToClipboard(template.templateId)}
                    className="p-2 hover:bg-green-100 rounded transition text-green-600"
                    title="Copy Liquid Code"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => onCopy(template)}
                    className="p-2 hover:bg-orange-100 rounded transition text-orange-600"
                    title="Duplicate Template"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(template._id)}
                    className="p-2 hover:bg-red-100 rounded transition text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {copiedId === template.templateId && (
                  <div className="text-xs text-green-600 mt-1">Copied!</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
