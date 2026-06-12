import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatDate } from '../utils/helpers';
import { useToast } from '../components/common/Toast';
import { User, Mail, ShieldAlert, Calendar, Heart, MapPin, Phone, Edit3, Save, X, Droplet, Activity, Camera } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const SERVER = API.replace('/api', '');

const DEFAULT_AVATARS = [
  { seed: 'Adam', label: 'Adam' },
  { seed: 'Bella', label: 'Bella' },
  { seed: 'Carlos', label: 'Carlos' },
  { seed: 'Diana', label: 'Diana' },
  { seed: 'Ethan', label: 'Ethan' },
  { seed: 'Fiona', label: 'Fiona' },
  { seed: 'George', label: 'George' },
  { seed: 'Hannah', label: 'Hannah' },
  { seed: 'Ivan', label: 'Ivan' },
  { seed: 'Julia', label: 'Julia' },
  { seed: 'Kevin', label: 'Kevin' },
  { seed: 'Luna', label: 'Luna' },
];

export const Profile = () => {
  const { currentUser, isDonor, updateProfileState } = useAuth();
  const { showToast } = useToast();
  const fileRef = useRef(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [profileImage, setProfileImage] = useState('');

  const [form, setForm] = useState({ name: '', age: 30, gender: 'Male', bloodGroup: '', city: '', phone: '', availability: 1, eligibility: 1 });

  useEffect(() => {
    if (currentUser && isDonor) {
      setLoading(true);
      api.getDonorByEmail(currentUser.email)
        .then((profile) => {
          setDonorProfile(profile);
          setProfileImage(profile?.profileImage || '');
          setForm({
            name: currentUser.name || '',
            age: profile?.age ?? 30,
            gender: profile?.gender || 'Male',
            bloodGroup: profile?.bloodGroup || 'O+',
            city: profile?.city || '',
            phone: profile?.phone || '',
            availability: profile?.availability ?? 1,
            eligibility: profile?.eligibility ?? 1,
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (currentUser) {
      setForm({ name: currentUser.name || '', age: 30, gender: 'Male', bloodGroup: '', city: '', phone: '', availability: 1, eligibility: 1 });
    }
  }, [currentUser]);

  const startEditing = () => {
    if (isDonor && donorProfile) {
      setForm({
        name: currentUser.name || '',
        age: donorProfile.age ?? 30,
        gender: donorProfile.gender || 'Male',
        bloodGroup: donorProfile.bloodGroup || 'O+',
        city: donorProfile.city || '',
        phone: donorProfile.phone || '',
        availability: donorProfile.availability ?? 1,
        eligibility: donorProfile.eligibility ?? 1,
      });
    } else {
      setForm({ name: currentUser.name || '', age: 30, gender: 'Male', bloodGroup: 'O+', city: '', phone: '', availability: 1, eligibility: 1 });
    }
    setEditing(true);
  };

  const cancelEditing = () => { setEditing(false); setShowImagePicker(false); };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Name is required.', 'warning'); return; }
    setSaving(true);
    try {
      await api.updateUser(currentUser.id, { name: form.name });
      updateProfileState({ name: form.name });
      if (isDonor) {
        const donorId = donorProfile?.id;
        if (donorId) {
          await api.updateDonor(donorId, {
            age: form.age, gender: form.gender, bloodGroup: form.bloodGroup, city: form.city, phone: form.phone,
            availability: form.availability, eligibility: form.eligibility, profileImage,
          });
          setDonorProfile(prev => ({ ...prev, age: form.age, gender: form.gender, bloodGroup: form.bloodGroup, city: form.city, phone: form.phone, availability: form.availability, eligibility: form.eligibility, profileImage }));
        }
      }
      showToast('Profile updated successfully!', 'success');
      setEditing(false);
      setShowImagePicker(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectAvatar = (seed) => {
    setProfileImage(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
    setShowImagePicker(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await api.uploadImage(file);
      setProfileImage(`${SERVER}${result.url}`);
      setShowImagePicker(false);
      showToast('Photo uploaded!', 'success');
    } catch (err) {
      showToast('Upload failed.', 'error');
    }
  };

  if (!currentUser) return null;

  const bgOptions = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const displayImage = profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`;

  return (
    <div className="flex-1 bg-bg-light dark:bg-bg-dark p-6 transition-colors duration-300">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Banner */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
              My Account Profile
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Review and manage your profile details.
            </p>
          </div>
          {!editing ? (
            <button onClick={startEditing} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-650 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 cursor-pointer shadow-sm">
              <Edit3 className="h-4 w-4 text-primary" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer shadow-sm disabled:opacity-50">
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={cancelEditing} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-650 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 cursor-pointer shadow-sm">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Credentials card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={displayImage}
                alt={currentUser.name}
                className="h-24 w-24 rounded-full mx-auto object-cover ring-4 ring-primary/10"
              />
              {editing && (
                <button onClick={() => setShowImagePicker(true)}
                  className="absolute -bottom-1 -right-1 bg-primary hover:bg-primary-hover text-white rounded-full p-1.5 shadow-md cursor-pointer">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Image picker modal */}
            {showImagePicker && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowImagePicker(false)}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-white">Choose Profile Photo</h3>
                    <button onClick={() => setShowImagePicker(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="h-5 w-5" /></button>
                  </div>

                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-3 text-left">Default Avatars</p>
                  <div className="grid grid-cols-6 gap-3 mb-5">
                    {DEFAULT_AVATARS.map(a => (
                      <button key={a.seed} onClick={() => selectAvatar(a.seed)}
                        className={`rounded-xl border-2 p-1.5 cursor-pointer transition-all hover:border-primary ${profileImage?.includes(a.seed) ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 dark:border-slate-700'}`}>
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${a.seed}`} alt={a.label}
                          className="h-10 w-10 rounded-full mx-auto" />
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-3 text-left">Upload</p>
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary cursor-pointer transition-colors">
                    Upload a custom photo
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>
              </div>
            )}

            <div>
              {editing ? (
                <input
                  type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full text-center text-lg font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-primary"
                />
              ) : (
                <h3 className="font-extrabold text-slate-850 dark:text-white text-lg">{currentUser.name}</h3>
              )}
              <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary mt-1">
                {currentUser.role}
              </span>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 text-xs text-slate-500 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Member since {formatDate(currentUser.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Donor details card */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-850 dark:text-white border-b border-slate-50 dark:border-slate-850 pb-3 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              {isDonor ? 'Donor Details' : 'Account Details'}
            </h3>

            {isDonor ? (
              loading ? (
                <p className="text-xs text-slate-400 animate-pulse">Loading details...</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-655 dark:text-slate-350">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="block text-[10px] uppercase font-bold text-slate-400"><Droplet className="h-3 w-3 inline mr-1" />Blood Group</span>
                    {editing ? (
                      <select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary">
                        {bgOptions.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    ) : (
                      <span className="text-sm font-bold text-red-500 mt-1 block">{donorProfile?.bloodGroup}</span>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="block text-[10px] uppercase font-bold text-slate-400"><User className="h-3 w-3 inline mr-1" />Age</span>
                    {editing ? (
                      <input type="number" min={1} max={120} value={form.age}
                        onChange={e => setForm({ ...form, age: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary" />
                    ) : (
                      <span className="text-sm font-bold text-slate-800 dark:text-white mt-1 block">{donorProfile?.age ?? 30}</span>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="block text-[10px] uppercase font-bold text-slate-400"><Activity className="h-3 w-3 inline mr-1" />Total Donations</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white mt-1 block">{donorProfile?.totalDonations || 0} times</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="block text-[10px] uppercase font-bold text-slate-400"><User className="h-3 w-3 inline mr-1" />Gender</span>
                    {editing ? (
                      <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary">
                        {['Male','Female','Other'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    ) : (
                      <span className="text-sm font-bold text-slate-800 dark:text-white mt-1 block">{donorProfile?.gender || 'Male'}</span>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="block text-[10px] uppercase font-bold text-slate-400"><MapPin className="h-3 w-3 inline mr-1" />City</span>
                    {editing ? (
                      <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                        placeholder="Your city"
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary" />
                    ) : (
                      <span className="text-sm font-bold text-slate-850 dark:text-white mt-1 block">{donorProfile?.city || 'Not set'}</span>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="block text-[10px] uppercase font-bold text-slate-400"><Phone className="h-3 w-3 inline mr-1" />Phone</span>
                    {editing ? (
                      <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="Your phone"
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary" />
                    ) : (
                      <span className="text-sm font-bold text-slate-850 dark:text-white mt-1 block">{donorProfile?.phone || 'Not set'}</span>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Availability</span>
                    {editing ? (
                      <select value={form.availability} onChange={e => setForm({ ...form, availability: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary">
                        <option value={1}>Available</option>
                        <option value={0}>Unavailable</option>
                      </select>
                    ) : (
                      <span className={`text-xs font-bold mt-1 block ${donorProfile?.availability ? 'text-emerald-500' : 'text-red-500'}`}>
                        {donorProfile?.availability ? 'Available' : 'Unavailable'}
                      </span>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Eligibility</span>
                    {editing ? (
                      <select value={form.eligibility} onChange={e => setForm({ ...form, eligibility: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary">
                        <option value={1}>Eligible</option>
                        <option value={0}>Ineligible</option>
                      </select>
                    ) : (
                      <span className={`text-xs font-bold mt-1 block ${donorProfile?.eligibility ? 'text-emerald-500' : 'text-red-500'}`}>
                        {donorProfile?.eligibility ? 'Medically Fit' : 'Ineligible'}
                      </span>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                <Heart className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                {editing ? (
                  <div className="max-w-xs mx-auto space-y-3">
                    <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                      placeholder="Your city"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary" />
                    <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="Your phone"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary" />
                  </div>
                ) : (
                  <>
                    <p>This account is configured in requester mode.</p>
                    <p className="mt-1">Switch to donor role to manage donation details.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default Profile;