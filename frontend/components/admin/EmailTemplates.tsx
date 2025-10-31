'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/admin';

interface EmailTemplate {
  id: number;
  code: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
  description: string;
}

export default function EmailTemplates() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await adminService.getEmailTemplates(selectedCategory);
      // Parse variables JSON string to array
      const parsedTemplates = response.data.map((template: any) => ({
        ...template,
        variables: typeof template.variables === 'string'
          ? JSON.parse(template.variables)
          : template.variables
      }));
      setTemplates(parsedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditMode(false);
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      await adminService.updateEmailTemplate(selectedTemplate.id, {
        subject: selectedTemplate.subject,
        body: selectedTemplate.body,
        is_active: selectedTemplate.is_active,
      });
      alert('Template updated successfully!');
      setEditMode(false);
      fetchTemplates();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!selectedTemplate) return;
    if (!confirm('Are you sure you want to reset this template to default?')) return;

    try {
      await adminService.resetEmailTemplate(selectedTemplate.id);
      alert('Template reset to default');
      fetchTemplates();
      setSelectedTemplate(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reset template');
    }
  };

  const categories = [
    { value: 'all', label: 'All Templates', icon: '📧' },
    { value: 'customer', label: 'Customer', icon: '👤' },
    { value: 'vendor', label: 'Vendor', icon: '🏪' },
    { value: 'admin', label: 'Admin', icon: '⚙️' },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'vendor': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Templates</h2>
        <p className="text-gray-600">Manage and customize email notification templates</p>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex gap-3">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setSelectedCategory(cat.value);
              setSelectedTemplate(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === cat.value
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-4 max-h-[700px] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Templates ({templates.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${template.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedTemplate.description}</p>
                </div>
                <div className="flex gap-2">
                  {!editMode ? (
                    <>
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                      >
                        Edit Template
                      </button>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                      >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          fetchTemplates();
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                      >
                        Reset to Default
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Template Code */}
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <span className="text-xs font-mono text-gray-600">Code: {selectedTemplate.code}</span>
              </div>

              {/* Available Variables */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Available Variables:</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedTemplate.variables) && selectedTemplate.variables.map((variable) => (
                    <code key={variable} className="px-2 py-1 bg-white text-blue-700 text-xs rounded border border-blue-300">
                      {`{{${variable}}}`}
                    </code>
                  ))}
                  {(!selectedTemplate.variables || !Array.isArray(selectedTemplate.variables)) && (
                    <span className="text-sm text-gray-500">No variables defined</span>
                  )}
                </div>
                <p className="text-xs text-blue-700 mt-2">Use these variables in your subject and body. They will be replaced with actual values when the email is sent.</p>
              </div>

              {/* Subject Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                {editMode ? (
                  <input
                    type="text"
                    value={selectedTemplate.subject}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-900">{selectedTemplate.subject}</div>
                )}
              </div>

              {/* Body Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Body (HTML)</label>
                {editMode ? (
                  <textarea
                    value={selectedTemplate.body}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{selectedTemplate.body}</pre>
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTemplate.is_active}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, is_active: e.target.checked })}
                    disabled={!editMode}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Template is active</span>
                </label>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Preview (with sample data)</h4>
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <strong className="text-sm text-gray-700">Subject:</strong>
                      <p className="text-gray-900 mt-1">{selectedTemplate.subject}</p>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: selectedTemplate.body }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Template Selected</h3>
              <p className="text-gray-600">Select a template from the list to view and edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

