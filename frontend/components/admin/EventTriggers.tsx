'use client';

import { useState, useEffect } from 'react';

interface EmailTemplate {
  id: number;
  code: string;
  name: string;
  subject: string;
}

interface WhatsAppTemplate {
  id: number;
  code: string;
  name: string;
  body: string;
}

interface EventTrigger {
  id: number;
  event_code: string;
  event_name: string;
  event_category: string;
  description: string;
  email_template_id: number | null;
  whatsapp_template_id: number | null;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  is_active: boolean;
  available_variables: string[];
  email_template?: EmailTemplate;
  whatsapp_template?: WhatsAppTemplate;
}

interface AvailableTemplates {
  email_templates: EmailTemplate[];
  whatsapp_templates: WhatsAppTemplate[];
}

export default function EventTriggers() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [triggers, setTriggers] = useState<EventTrigger[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTrigger, setSelectedTrigger] = useState<EventTrigger | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<AvailableTemplates | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTriggers();
    fetchStatistics();
  }, [selectedCategory]);

  const fetchTriggers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/event-triggers?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setTriggers(data.data);
      }
    } catch (error) {
      console.error('Error fetching triggers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/event-triggers/statistics`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchAvailableTemplates = async (triggerId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/event-triggers/${triggerId}/available-templates`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAvailableTemplates(data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleEditTrigger = async (trigger: EventTrigger) => {
    setSelectedTrigger(trigger);
    await fetchAvailableTemplates(trigger.id);
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!selectedTrigger) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/event-triggers/${selectedTrigger.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_template_id: selectedTrigger.email_template_id,
            whatsapp_template_id: selectedTrigger.whatsapp_template_id,
            email_enabled: selectedTrigger.email_enabled,
            whatsapp_enabled: selectedTrigger.whatsapp_enabled,
            is_active: selectedTrigger.is_active,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Event trigger updated successfully!');
        setShowEditor(false);
        setSelectedTrigger(null);
        fetchTriggers();
        fetchStatistics();
      } else {
        alert('Failed to update event trigger');
      }
    } catch (error) {
      console.error('Error saving trigger:', error);
      alert('Error saving event trigger');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, string> = {
      customer: 'bg-blue-100 text-blue-800',
      vendor: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
    };
    return badges[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredTriggers = triggers.filter(trigger =>
    trigger.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trigger.event_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trigger.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Triggers</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure which templates are sent for each event
          </p>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Events</div>
            <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-600">Active</div>
            <div className="text-2xl font-bold text-green-900">{statistics.active}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600">Email Enabled</div>
            <div className="text-2xl font-bold text-blue-900">{statistics.email_enabled}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600">WhatsApp Enabled</div>
            <div className="text-2xl font-bold text-purple-900">{statistics.whatsapp_enabled}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-sm text-yellow-600">Not Configured</div>
            <div className="text-2xl font-bold text-yellow-900">{statistics.not_configured}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'customer', 'vendor', 'admin'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Triggers List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading event triggers...</div>
        ) : filteredTriggers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No event triggers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTriggers.map((trigger) => (
                  <tr key={trigger.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{trigger.event_name}</div>
                      <div className="text-xs text-gray-500">{trigger.event_code}</div>
                      {trigger.description && (
                        <div className="text-xs text-gray-400 mt-1">{trigger.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(trigger.event_category)}`}>
                        {trigger.event_category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {trigger.email_template ? (
                        <div>
                          <div className="text-sm text-gray-900">{trigger.email_template.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {trigger.email_enabled ? (
                              <span className="text-xs text-green-600">✓ Enabled</span>
                            ) : (
                              <span className="text-xs text-gray-400">Disabled</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not configured</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {trigger.whatsapp_template ? (
                        <div>
                          <div className="text-sm text-gray-900">{trigger.whatsapp_template.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {trigger.whatsapp_enabled ? (
                              <span className="text-xs text-green-600">✓ Enabled</span>
                            ) : (
                              <span className="text-xs text-gray-400">Disabled</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not configured</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {trigger.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditTrigger(trigger)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && selectedTrigger && availableTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedTrigger.event_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedTrigger.event_code}</p>
                  {selectedTrigger.description && (
                    <p className="text-sm text-gray-500 mt-2">{selectedTrigger.description}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowEditor(false);
                    setSelectedTrigger(null);
                    setAvailableTemplates(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Available Variables */}
              {selectedTrigger.available_variables && selectedTrigger.available_variables.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Available Variables:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrigger.available_variables.map((variable) => (
                      <code key={variable} className="px-2 py-1 bg-white text-blue-700 text-xs rounded border border-blue-300">
                        {`{{${variable}}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Template Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900">Email Template</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTrigger.email_enabled}
                      onChange={(e) => setSelectedTrigger({ ...selectedTrigger, email_enabled: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Enable Email</span>
                  </label>
                </div>
                <select
                  value={selectedTrigger.email_template_id || ''}
                  onChange={(e) => setSelectedTrigger({ ...selectedTrigger, email_template_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!selectedTrigger.email_enabled}
                >
                  <option value="">-- Select Email Template --</option>
                  {availableTemplates.email_templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* WhatsApp Template Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900">WhatsApp Template</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTrigger.whatsapp_enabled}
                      onChange={(e) => setSelectedTrigger({ ...selectedTrigger, whatsapp_enabled: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Enable WhatsApp</span>
                  </label>
                </div>
                <select
                  value={selectedTrigger.whatsapp_template_id || ''}
                  onChange={(e) => setSelectedTrigger({ ...selectedTrigger, whatsapp_template_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!selectedTrigger.whatsapp_enabled}
                >
                  <option value="">-- Select WhatsApp Template --</option>
                  {availableTemplates.whatsapp_templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Event Status</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {selectedTrigger.is_active ? 'This event trigger is active and will send notifications' : 'This event trigger is inactive'}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTrigger.is_active}
                    onChange={(e) => setSelectedTrigger({ ...selectedTrigger, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditor(false);
                  setSelectedTrigger(null);
                  setAvailableTemplates(null);
                }}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
