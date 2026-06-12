import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { formatDate } from '../utils/helpers';
import { 
  PlusCircle, Hospital, MapPin, Phone, HeartHandshake, 
  AlertCircle, ShieldAlert, CheckCircle2, RefreshCw 
} from 'lucide-react';

export const RequestBlood = () => {
  const { currentUser, isAdmin } = useAuth();
  const { showToast } = useToast();

  // Data state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    hospital: '',
    city: '',
    contactNumber: '',
    urgency: 'Critical',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    try { setRequests(await api.getRequests()); }
    catch { setRequests([]); }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    const unsub = api.subscribeRequests((data) => {
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.hospital || !formData.city || !formData.contactNumber) {
      showToast('All fields are required.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReq = await api.addRequest({
        ...formData,
        status: 'Pending',
        createdBy: currentUser?.email || 'anonymous',
      });
      showToast('Emergency request successfully published!', 'success');
      
      // Send notifications to matching donors and admins
      try {
        await api.sendDonorNotification(newReq);
        await api.sendAdminNotification(newReq);
        
        // Send browser push notification
        await api.sendPushNotification(
          `🚨 Emergency Blood Request: ${formData.bloodGroup}`,
          {
            body: `Urgent request from ${formData.patientName} at ${formData.hospital}`,
            tag: `request-${newReq.id}`,
            requireInteraction: true,
          }
        );
      } catch (notifError) {
        console.warn('Notification error (non-critical):', notifError);
      }
      
      // Reset form
      setFormData({
        patientName: '',
        bloodGroup: 'O+',
        hospital: '',
        city: '',
        contactNumber: '',
        urgency: 'Critical',
      });
    } catch (error) {
      console.error(error);
      showToast('Failed to submit emergency request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateRequest(id, { status: newStatus });
      showToast(`Request marked as ${newStatus}!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update request status.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
          <p className="text-sm font-semibold text-slate-500">Querying active requests queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-light dark:bg-bg-dark p-6 transition-colors duration-300">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
              Emergency Response Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Publish critical emergency requests or track blood fulfillment channels.
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-655 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 cursor-pointer shadow-sm"
          >
            <RefreshCw className="h-4 w-4 text-primary" /> Refresh Queue
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Submit Request Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-50 dark:border-slate-850 pb-4">
              <PlusCircle className="h-5.5 w-5.5 text-red-500" /> Publish Urgent Request
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gary Zhang"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-black px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-primary focus:bg-black focus:outline-none dark:border-slate-800 dark:bg-black dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Blood Group Required
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-black px-3 py-2.5 text-xs text-white dark:border-slate-800 dark:bg-black dark:text-white"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-black px-3 py-2.5 text-xs text-white dark:border-slate-800 dark:bg-black dark:text-white"
                  >
                    {['Critical', 'High', 'Medium', 'Low'].map((urg) => (
                      <option key={urg} value={urg}>{urg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Hospital Name & Address
                </label>
                <div className="relative">
                  <Hospital className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Northwestern Memorial Hospital"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-black pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-primary focus:bg-black focus:outline-none dark:border-slate-800 dark:bg-black dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chicago"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-black pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-primary focus:bg-black focus:outline-none dark:border-slate-800 dark:bg-black dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Contact Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 555-4490"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-black pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-primary focus:bg-black focus:outline-none dark:border-slate-800 dark:bg-black dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-red-500 hover:bg-red-650 py-3 text-xs font-bold text-white shadow-lg shadow-red-500/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? 'Publishing Ticket...' : 'Submit Emergency Request'}
              </button>
            </form>
          </div>

          {/* Active Requests List */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-50 dark:border-slate-850 pb-4">
              <HeartHandshake className="h-5.5 w-5.5 text-primary" /> Active Emergency Queue
            </h3>

            {requests.length > 0 ? (
              <div className="space-y-4 overflow-y-auto max-h-[550px] pr-2">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-150 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 flex flex-col sm:flex-row justify-between gap-4 transition-all hover:bg-white dark:hover:bg-slate-900"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
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
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-450">
                        <div className="flex items-center gap-1.5">
                          <Hospital className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate">{req.hospital}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{req.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>Contact: {req.contactNumber}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 pt-1">
                        Posted: {formatDate(req.createdAt)}
                      </div>
                    </div>

                    {/* Admin or Creator actions */}
                    <div className="flex flex-row sm:flex-col justify-end items-center gap-2 self-end sm:self-center">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        req.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20' :
                        req.status === 'Cancelled' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' :
                        'bg-red-50 text-red-500 dark:bg-red-950/25 animate-pulse'
                      }`}>
                        {req.status}
                      </span>
                      
                      {/* Close request — available to admins and the creator */}
                      {req.status === 'Pending' && (isAdmin || currentUser?.email === req.createdBy) && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'Fulfilled')}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Close Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                No active emergency blood requests currently in queue.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
export default RequestBlood;