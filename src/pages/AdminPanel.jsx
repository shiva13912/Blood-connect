import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';
import { formatDate } from '../utils/helpers';
import { 
  ShieldCheck, Heart, FileText, Users, Plus, 
  Trash2, Edit, CheckCircle, XCircle, ShieldAlert 
} from 'lucide-react';

export const AdminPanel = () => {
  const { showToast } = useToast();

  // Tab State
  const [activeTab, setActiveTab] = useState('donors'); // 'donors' | 'requests' | 'users'

  // Data lists
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state for Donors
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingDonorId, setEditingDonorId] = useState(null);
  const [donorForm, setDonorForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    city: '',
    phone: '',
    email: '',
    eligibility: true,
    lastDonationDate: '',
    totalDonations: 0,
    availability: true,
  });

  useEffect(() => {
    setLoading(true);
    const unsubDonors = api.subscribeDonors((data) => {
      setDonors(data);
      setLoading(false);
    });
    const unsubRequests = api.subscribeRequests((data) => {
      setRequests(data);
      setLoading(false);
    });
    api.getUsers().then(setUsers).catch(() => {});
    return () => { unsubDonors(); unsubRequests(); };
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingDonorId(null);
    setDonorForm({
      name: '',
      age: '',
      gender: 'Male',
      bloodGroup: 'O+',
      city: '',
      phone: '',
      email: '',
      eligibility: true,
      lastDonationDate: '',
      totalDonations: 0,
      availability: true,
      profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=newdonor`
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (donor) => {
    setModalMode('edit');
    setEditingDonorId(donor.id);
    setDonorForm({
      name: donor.name || '',
      age: donor.age || '',
      gender: donor.gender || 'Male',
      bloodGroup: donor.bloodGroup || 'O+',
      city: donor.city || '',
      phone: donor.phone || '',
      email: donor.email || '',
      eligibility: donor.eligibility !== undefined ? donor.eligibility : true,
      lastDonationDate: donor.lastDonationDate || '',
      totalDonations: donor.totalDonations !== undefined ? donor.totalDonations : 0,
      availability: donor.availability !== undefined ? donor.availability : true,
      profileImage: donor.profileImage || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitDonorForm = async (e) => {
    e.preventDefault();
    if (!donorForm.name || !donorForm.city || !donorForm.email) {
      showToast('Name, Email, and City are required fields.', 'warning');
      return;
    }

    try {
      if (modalMode === 'create') {
        const newDonor = await api.addDonor({
          ...donorForm,
          profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(donorForm.name)}`
        });
        setDonors((prev) => [...prev, newDonor]);
        showToast('Donor profile created successfully!', 'success');
      } else {
        const updated = await api.updateDonor(editingDonorId, donorForm);
        setDonors((prev) => prev.map((d) => (d.id === editingDonorId ? updated : d)));
        showToast('Donor profile modified successfully!', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      showToast('Failed to save donor information.', 'error');
    }
  };

  const handleDeleteDonor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donor profile?')) return;
    try {
      await api.deleteDonor(id);
      setDonors((prev) => prev.filter((d) => d.id !== id));
      showToast('Donor profile deleted.', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to delete donor.', 'error');
    }
  };

  const handleUpdateRequestStatus = async (id, newStatus) => {
    try {
      const updated = await api.updateRequest(id, { status: newStatus });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showToast(`Request status modified to ${newStatus}.`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update request.', 'error');
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Delete this emergency request ticket?')) return;
    try {
      await api.deleteRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      showToast('Request ticket deleted.', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to delete request.', 'error');
    }
  };

  const handleUpdateUserRole = async (id, newRole) => {
    try {
      const updated = await api.updateUser(id, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      showToast(`User privileges modified to ${newRole}!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update user role.', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('User record deleted from database.', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to delete user.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
          <p className="text-sm font-semibold text-slate-500">Retrieving system registries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-light dark:bg-bg-dark p-6 transition-colors duration-300">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Administrative Control Console
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Supervise donor files, emergency workflows, and network user authorization settings.
            </p>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
          <button
            onClick={() => setActiveTab('donors')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'donors'
                ? 'border-primary text-primary dark:border-primary-dark dark:text-primary-dark'
                : 'border-transparent text-slate-400 hover:text-slate-655'
            }`}
          >
            <Heart className="h-4.5 w-4.5" /> Donors Directory ({donors.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'requests'
                ? 'border-primary text-primary dark:border-primary-dark dark:text-primary-dark'
                : 'border-transparent text-slate-400 hover:text-slate-655'
            }`}
          >
            <FileText className="h-4.5 w-4.5" /> Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'border-primary text-primary dark:border-primary-dark dark:text-primary-dark'
                : 'border-transparent text-slate-400 hover:text-slate-655'
            }`}
          >
            <Users className="h-4.5 w-4.5" /> Platform Users ({users.length})
          </button>
        </div>

        {/* TAB 1: DONORS MANAGEMENT */}
        {activeTab === 'donors' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold text-slate-800 dark:text-white">Active Donors list</h3>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl dark:bg-primary-dark transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Donor
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Blood Group</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Eligibility</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                  {donors.map((donor) => (
                    <tr key={donor.id} className="text-slate-700 dark:text-slate-305 hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
                      <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">{donor.name}</td>
                      <td className="py-3.5 font-black text-red-500">{donor.bloodGroup}</td>
                      <td className="py-3.5 text-xs">{donor.city}</td>
                      <td className="py-3.5 text-xs">{donor.phone || 'N/A'}</td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          donor.availability ? 'bg-emerald-50 text-emerald-500' : 'bg-red-55 bg-red-500/5 text-red-500'
                        }`}>
                          {donor.availability ? 'Available' : 'Resting'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        {donor.eligibility ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(donor)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950 text-slate-500 dark:text-slate-400 cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDonor(donor.id)}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 dark:border-slate-800 dark:hover:bg-red-950/20 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: REQUESTS MANAGEMENT */}
        {activeTab === 'requests' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
            <h3 className="text-md font-bold text-slate-800 dark:text-white">Fulfillment Cases</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                    <th className="pb-3">Patient</th>
                    <th className="pb-3">Group</th>
                    <th className="pb-3">Hospital</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Urgency</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                  {requests.map((req) => (
                    <tr key={req.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
                      <td className="py-3.5 font-bold text-slate-850 dark:text-slate-200">{req.patientName}</td>
                      <td className="py-3.5 font-black text-red-500">{req.bloodGroup}</td>
                      <td className="py-3.5 text-xs">{req.hospital}</td>
                      <td className="py-3.5 text-xs">{req.city}</td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.urgency === 'Critical' ? 'bg-red-50 text-red-500' :
                          req.urgency === 'High' ? 'bg-amber-50 text-amber-500' :
                          'bg-blue-50 text-blue-500'
                        }`}>
                          {req.urgency}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          req.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'Fulfilled')}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            Mark Fulfilled
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 dark:border-slate-800 dark:hover:bg-red-950/20 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PLATFORM USERS */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
            <h3 className="text-md font-bold text-slate-850 dark:text-white">Registered Users</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Registered Date</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                  {users.map((u) => (
                    <tr key={u.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
                      <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">{u.name}</td>
                      <td className="py-3.5 text-xs">{u.email}</td>
                      <td className="py-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        >
                          <option value="admin">Admin</option>
                          <option value="donor">Donor</option>
                          <option value="requester">Requester</option>
                        </select>
                      </td>
                      <td className="py-3.5 text-xs text-slate-450">{formatDate(u.createdAt)}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 dark:border-slate-800 dark:hover:bg-red-950/20 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Donor Edit/Create Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-y-auto max-h-[90vh]">
            
            <div className="mb-5 border-b border-slate-50 dark:border-slate-850 pb-3">
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">
                {modalMode === 'create' ? 'Register New Donor' : 'Edit Donor details'}
              </h3>
            </div>

            <form onSubmit={handleSubmitDonorForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Donor Name</label>
                  <input
                    type="text"
                    required
                    value={donorForm.name}
                    onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={donorForm.age}
                    onChange={(e) => setDonorForm({ ...donorForm, age: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Gender</label>
                  <select
                    value={donorForm.gender}
                    onChange={(e) => setDonorForm({ ...donorForm, gender: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Blood Group</label>
                  <select
                    value={donorForm.bloodGroup}
                    onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={donorForm.city}
                    onChange={(e) => setDonorForm({ ...donorForm, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={donorForm.phone}
                    onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={donorForm.email}
                    onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Donations</label>
                  <input
                    type="number"
                    value={donorForm.totalDonations}
                    onChange={(e) => setDonorForm({ ...donorForm, totalDonations: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Last Donation Date</label>
                  <input
                    type="date"
                    value={donorForm.lastDonationDate}
                    onChange={(e) => setDonorForm({ ...donorForm, lastDonationDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-655 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={donorForm.availability}
                    onChange={(e) => setDonorForm({ ...donorForm, availability: e.target.checked })}
                    className="rounded border-slate-200 focus:ring-primary h-4 w-4"
                  />
                  Mark Available for Donation
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-655 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={donorForm.eligibility}
                    onChange={(e) => setDonorForm({ ...donorForm, eligibility: e.target.checked })}
                    className="rounded border-slate-200 focus:ring-primary h-4 w-4"
                  />
                  Mark Medically Eligible
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl text-slate-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl dark:bg-primary-dark cursor-pointer transition-colors shadow-sm"
                >
                  {modalMode === 'create' ? 'Create Donor' : 'Save Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminPanel;