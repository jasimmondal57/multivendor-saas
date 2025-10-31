'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  timestamp: string;
  read: boolean;
}

interface NotificationStats {
  pending_orders: number;
  processing_orders: number;
  ready_to_ship: number;
  today_orders: number;
  total_active: number;
}

export default function VendorNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastCheck, setLastCheck] = useState(new Date().toISOString());
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    fetchStats();

    // Poll every 10 seconds for new notifications
    intervalRef.current = setInterval(() => {
      fetchNotifications();
      fetchStats();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/v1/vendor/notifications', {
        params: { since: lastCheck },
      });
      
      if (response.data.success) {
        const newNotifications = response.data.data.notifications;
        
        if (newNotifications.length > 0) {
          // Add new notifications to the beginning
          setNotifications((prev) => [...newNotifications, ...prev].slice(0, 50)); // Keep last 50
          setUnreadCount((prev) => prev + newNotifications.length);
          setLastCheck(response.data.data.timestamp);

          // Show browser notification if permission granted
          if (Notification.permission === 'granted' && newNotifications.length > 0) {
            new Notification(newNotifications[0].title, {
              body: newNotifications[0].message,
              icon: '/logo.png',
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/v1/vendor/notifications/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        );
      case 'status_update':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          requestNotificationPermission();
        }}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Stats */}
          {stats && (
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  <span className="text-gray-600">Pending:</span>
                  <span className="ml-auto font-semibold text-gray-900">{stats.pending_orders}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  <span className="text-gray-600">Processing:</span>
                  <span className="ml-auto font-semibold text-gray-900">{stats.processing_orders}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-gray-600">Ready to Ship:</span>
                  <span className="ml-auto font-semibold text-gray-900">{stats.ready_to_ship}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  <span className="text-gray-600">Today:</span>
                  <span className="ml-auto font-semibold text-gray-900">{stats.today_orders}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    {getNotificationIcon(notification.type)}
                    <div className="ml-3 flex-1">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notification.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm font-semibold mb-1">No notifications</p>
                <p className="text-xs">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

