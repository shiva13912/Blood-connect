import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { formatDate } from '../utils/helpers';
import { 
  HeartHandshake, Hospital, MapPin, Phone, 
  Filter, List, Bell, AlertCircle, Info, CheckCircle, X 
} from 'lucide-react';

const URGENCY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

const getNotifIcon = (type) => {
  switch (type) {
    case 'emergency_request': return AlertCircle;
    case 'emergency_request_admin': return Info;
    default: return CheckCircle;
  }
};

const getNotifStyle = (type) => {
  switch (type) {
    case 'emergency_request': return 'bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500';
    case 'emergency_request_admin': return 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500';
    default: return 'bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500';
  }
};

export const BloodRequests = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const unsub = api.subscribeRequests((reqs) => {
      setRequests(reqs);
      setLoading(false);
    });
    if (currentUser) {
      api.getUserNotifications(currentUser.id, currentUser.email).then(setNotifications);
    }
    return () => unsub();
  }, [currentUser]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateRequest(id, { status: newStatus });
      showToast(`Request marked as ${newStatus}!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update request status.', 'error');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDismiss = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const sortedRequests = [...requests].sort((a, b) => {
    const urgencyA = URGENCY_ORDER[a.urgency] ?? 99;
    const urgencyB = URGENCY_ORDER[b.urgency] ?? 99;
    if (urgencyA !== urgencyB) return urgencyA - urgencyB;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const statuses = ['All', 'Pending', 'Fulfilled', 'Cancelled'];
  const filteredRequests = filterStatus === 'All'
    ? sortedRequests
    : sortedRequests.filter((r) => r.status === filterStatus);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
          <p className="text-sm font-semibold text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-light dark:bg-bg-dark p-6 transition-colors duration-300">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
              <List className="h-6 w-6 text-primary" /> All Blood Requests
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              View all emergency blood requests and notifications from across the platform.
            </p>
          </div>
          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-655 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 cursor-pointer shadow-sm"
          >
            <RefreshCw className="h-4 w-4 text-primary" /> Refresh
          </button>
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-slate-400" />
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                filterStatus === s
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Main grid: Requests + Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Requests List */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-50 dark:border-slate-850 pb-4">
              <HeartHandshake className="h-5.5 w-5.5 text-primary" /> 
              {filteredRequests.length} Request{filteredRequests.length !== 1 ? 's' : ''}
            </h3>

            {filteredRequests.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-150 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 flex flex-col sm:flex-row justify-between gap-4 transition-all hover:bg-white dark:hover:bg-slate-900"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{req.patientName}</span>
                        <span className="text-xs font-black text-red-500 px-2 py-0.5 rounded bg-red-500/10">
                          {req.bloodGroup}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.urgency === 'Critical' ? 'bg-red-50 text-red-650 dark:bg-red-950/20' :
                          req.urgency === 'High' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                          'bg-blue-50 text-blue-500 dark:bg-blue-950/20'
                        }`}>
                          {req.urgency}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          req.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20' :
                          req.status === 'Cancelled' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' :
                          'bg-red-50 text-red-500 dark:bg-red-950/25 animate-pulse'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-450">
                        <div className="flex items-center gap-1.5">
                          <Hospital className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate">{req.hospital}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{req.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{req.contactNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span>By: {req.createdBy || 'Unknown'}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 pt-1">
                        Posted: {formatDate(req.createdAt)}
                      </div>
                    </div>

                    {req.status === 'Pending' && (currentUser?.role === 'admin' || currentUser?.email === req.createdBy) && (
                      <div className="flex items-end sm:items-center">
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'Fulfilled')}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
                        >
                          Close Request
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                <HeartHandshake className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                {filterStatus === 'All'
                  ? 'No blood requests yet. Create one from the Emergency Request page.'
                  : `No ${filterStatus.toLowerCase()} requests found.`}
              </div>
            )}
          </div>

          {/* Notifications Panel */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-50 dark:border-slate-850 pb-4">
              <Bell className="h-5.5 w-5.5 text-primary" /> 
              Notifications
            </h3>

            {notifications.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {notifications.map((n) => {
                  const Icon = getNotifIcon(n.type);
                  return (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl transition-colors ${getNotifStyle(n.type)} ${
                        !n.isRead ? 'bg-opacity-70' : 'bg-opacity-30'
                      }`}
                    >
                      <div className="flex gap-2">
                        <Icon className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary dark:text-primary-dark" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{n.title}</p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{n.message}</p>
                          
                          {n.requestData && (
                            <div className="mt-1.5 text-[10px] bg-white dark:bg-slate-950/50 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                              <p className="text-slate-700 dark:text-slate-300">
                                <span className="font-semibold">Patient:</span> {n.requestData.patientName}
                              </p>
                              <p className="text-slate-700 dark:text-slate-300">
                                <span className="font-semibold">Hospital:</span> {n.requestData.hospital}
                              </p>
                              <p className="text-slate-700 dark:text-slate-300">
                                <span className="font-semibold">Contact:</span> {n.requestData.contactNumber}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-1.5 gap-1">
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleString()}
                            </span>
                            <div className="flex gap-1">
                              {!n.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(n.id)}
                                  className="text-[10px] px-1.5 py-0.5 bg-primary text-white rounded hover:bg-primary-hover transition-colors cursor-pointer"
                                >
                                  Read
                                </button>
                              )}
                              <button
                                onClick={() => handleDismiss(n.id)}
                                className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                No notifications yet.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
export default BloodRequests;
