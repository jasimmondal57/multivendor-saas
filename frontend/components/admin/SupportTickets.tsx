'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface SupportTicket {
  id: number;
  ticket_number: string;
  user_id: number;
  user_type: 'customer' | 'vendor';
  vendor_id?: number;
  support_category_id: number;
  subject: string;
  description: string;
  attachments?: string[];
  order_id?: number;
  product_id?: number;
  return_order_id?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in_progress' | 'waiting_customer' | 'waiting_vendor' | 'resolved' | 'closed';
  assigned_to?: number;
  assigned_at?: string;
  resolution_notes?: string;
  resolved_at?: string;
  closed_at?: string;
  rating?: number;
  feedback?: string;
  first_response_at?: string;
  last_response_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  vendor?: {
    id: number;
    business_name: string;
  };
  category?: {
    id: number;
    name: string;
    icon: string;
  };
  assigned_to_user?: {
    id: number;
    name: string;
  };
  order?: {
    id: number;
    order_number: string;
  };
  product?: {
    id: number;
    name: string;
  };
  return_order?: {
    id: number;
    return_number: string;
  };
}

interface SupportTicketMessage {
  id: number;
  support_ticket_id: number;
  user_id: number;
  sender_type: 'customer' | 'vendor' | 'admin';
  message: string;
  attachments?: string[];
  is_internal_note: boolean;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
}

interface Statistics {
  total: number;
  open: number;
  assigned: number;
  in_progress: number;
  resolved: number;
  closed: number;
  customer_tickets: number;
  vendor_tickets: number;
  high_priority: number;
  unassigned: number;
  avg_resolution_time: number;
  avg_first_response_time: number;
  avg_rating: number;
}

type TabType = 'all' | 'customer' | 'vendor' | 'open' | 'assigned' | 'resolved' | 'closed' | 'my_tickets';

export default function SupportTickets() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketMessages, setTicketMessages] = useState<SupportTicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchStatistics();
    fetchTickets();
  }, [activeTab, searchQuery, filterPriority, filterStatus]);

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/support/tickets/statistics');
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params: any = { tab: activeTab };
      if (searchQuery) params.search = searchQuery;
      if (filterPriority) params.priority = filterPriority;
      if (filterStatus) params.status = filterStatus;

      const response = await api.get('/admin/support/tickets', { params });
      if (response.data.success) {
        setTickets(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId: number) => {
    try {
      const response = await api.get(`/admin/support/tickets/${ticketId}`);
      if (response.data.success) {
        setSelectedTicket(response.data.data);
        setTicketMessages(response.data.data.messages || []);
        setShowTicketModal(true);
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      const response = await api.post(`/admin/support/tickets/${selectedTicket.id}/messages`, {
        message: newMessage,
        is_internal_note: isInternalNote,
      });

      if (response.data.success) {
        setTicketMessages([...ticketMessages, response.data.data]);
        setNewMessage('');
        setIsInternalNote(false);
        fetchTicketDetails(selectedTicket.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      const response = await api.put(`/admin/support/tickets/${ticketId}/status`, { status });
      if (response.data.success) {
        fetchTickets();
        if (selectedTicket?.id === ticketId) {
          fetchTicketDetails(ticketId);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const updateTicketPriority = async (ticketId: number, priority: string) => {
    try {
      const response = await api.put(`/admin/support/tickets/${ticketId}/priority`, { priority });
      if (response.data.success) {
        fetchTickets();
        if (selectedTicket?.id === ticketId) {
          fetchTicketDetails(ticketId);
        }
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-indigo-100 text-indigo-800';
      case 'waiting_customer': return 'bg-yellow-100 text-yellow-800';
      case 'waiting_vendor': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'all', label: 'All Tickets', count: statistics?.total || 0 },
    { id: 'customer', label: 'Customer', count: statistics?.customer_tickets || 0 },
    { id: 'vendor', label: 'Vendor', count: statistics?.vendor_tickets || 0 },
    { id: 'open', label: 'Open', count: statistics?.open || 0 },
    { id: 'assigned', label: 'Assigned', count: statistics?.assigned || 0 },
    { id: 'resolved', label: 'Resolved', count: statistics?.resolved || 0 },
    { id: 'closed', label: 'Closed', count: statistics?.closed || 0 },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-600 mt-1">Manage customer and vendor support requests</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Tickets</div>
            <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Unassigned</div>
            <div className="text-2xl font-bold text-orange-600">{statistics.unassigned}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Avg Resolution Time</div>
            <div className="text-2xl font-bold text-blue-600">{statistics.avg_resolution_time}h</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Avg Rating</div>
            <div className="text-2xl font-bold text-green-600">{statistics.avg_rating?.toFixed(1) || 'N/A'}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Tickets List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No tickets found</div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => fetchTicketDetails(ticket.id)}
                className="p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-gray-600">{ticket.ticket_number}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        ticket.user_type === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {ticket.user_type}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>By: {ticket.user?.name}</span>
                      {ticket.category && <span>Category: {ticket.category.name}</span>}
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-mono text-sm text-gray-600">{selectedTicket.ticket_number}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Ticket Info */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Created by:</span>
                  <span className="ml-2 font-medium">{selectedTicket.user?.name} ({selectedTicket.user_type})</span>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium">{selectedTicket.category?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
                {selectedTicket.assigned_to_user && (
                  <div>
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="ml-2 font-medium">{selectedTicket.assigned_to_user.name}</span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-4 flex gap-2">
                <select
                  value={selectedTicket.status}
                  onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="open">Open</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_customer">Waiting Customer</option>
                  <option value="waiting_vendor">Waiting Vendor</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={selectedTicket.priority}
                  onChange={(e) => updateTicketPriority(selectedTicket.id, e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Original Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {selectedTicket.user?.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{selectedTicket.user?.name}</div>
                    <div className="text-xs text-gray-500">{new Date(selectedTicket.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <p className="text-gray-700">{selectedTicket.description}</p>
              </div>

              {/* Messages */}
              {ticketMessages.filter(m => !m.is_internal_note).map((message) => (
                <div key={message.id} className={`p-4 rounded-lg ${
                  message.sender_type === 'admin' ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      message.sender_type === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
                    }`}>
                      {message.user?.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {message.user?.name}
                        <span className="ml-2 text-xs text-gray-500">({message.sender_type})</span>
                      </div>
                      <div className="text-xs text-gray-500">{new Date(message.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <p className="text-gray-700">{message.message}</p>
                </div>
              ))}

              {/* Internal Notes */}
              {ticketMessages.filter(m => m.is_internal_note).length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Internal Notes (Admin Only)</h3>
                  {ticketMessages.filter(m => m.is_internal_note).map((message) => (
                    <div key={message.id} className="bg-yellow-50 p-4 rounded-lg mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {message.user?.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{message.user?.name}</div>
                          <div className="text-xs text-gray-500">{new Date(message.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                      <p className="text-gray-700">{message.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Box */}
            <div className="p-6 border-t border-gray-200">
              <div className="mb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Internal Note (Not visible to customer/vendor)</span>
                </label>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

