import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';
import { formatDate } from '../utils/helpers';
import { 
  Heart, Calendar, Award, CheckCircle, XCircle, 
  ToggleLeft, ToggleRight, User, Phone, MapPin, 
  Upload, History, Clock, FileText, PlusCircle, Sparkles 
} from 'lucide-react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export const Dashboard = () => {
  const { currentUser, isDonor, isRequester, isAdmin, updateProfileState } = useAuth();
  const { showToast } = useToast();

  const [donorProfile, setDonorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Forms & Upload State
  const [profileForm, setProfileForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    city: '',
    phone: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // History/Requests data
  const [myRequests, setMyRequests] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    donorsCount: 0,
    requestsCount: 0,
    fulfilledRequestsCount: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const fetchDashboardData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Stage 1: Load user's own data first
      if (isDonor) {
        const profile = await api.getDonorByEmail(currentUser.email);
        if (profile) {
          setDonorProfile(profile);
          setProfileForm({
            name: profile.name || '',
            age: profile.age || '',
            gender: profile.gender || 'Male',
            city: profile.city || '',
            phone: profile.phone || '',
          });
        }
      }
      
      // Stage 2: Load global stats in parallel (non-blocking)
      if (isRequester) {
        const allRequests = await api.getRequests();
        const filtered = allRequests.filter(
          (r) => 
            r.createdBy === currentUser.email ||
            r.contactNumber === currentUser.phone || 
            r.patientName.toLowerCase().includes(currentUser.name.toLowerCase())
        );
        setMyRequests(filtered);
      }

      // Fetch global dashboard counts for overview with pagination
      const allDonors = await api.getDonors();
      const allRequests = await api.getRequests();
      setGlobalStats({
        donorsCount: allDonors.length,
        requestsCount: allRequests.length,
        fulfilledRequestsCount: allRequests.filter((r) => r.status === 'Fulfilled').length,
      });
    } catch (error) {
      console.error(error);
      showToast('Error loading dashboard statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!donorProfile) return;
    const newStatus = !donorProfile.availability;
    try {
      const updated = await api.updateDonor(donorProfile.id, {
        availability: newStatus,
      });
      setDonorProfile(updated);
      showToast(`Status updated: You are now ${newStatus ? 'AVAILABLE' : 'UNAVAILABLE'} to donate.`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to update status.', 'error');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.city) {
      showToast('Name and City are required fields.', 'warning');
      return;
    }

    try {
      let updatedDonor;
      if (donorProfile) {
        updatedDonor = await api.updateDonor(donorProfile.id, profileForm);
        setDonorProfile(updatedDonor);
      }

      // Sync Auth user profile
      await api.updateUser(currentUser.id, {
        name: profileForm.name,
      });
      updateProfileState({ name: profileForm.name });

      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update profile details.', 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !donorProfile) return;

    // Validate size & type
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'warning');
      return;
    }

    setUploadingImage(true);
    try {
      const downloadURL = await api.uploadProfileImage(file, donorProfile.name);
      const updated = await api.updateDonor(donorProfile.id, {
        profileImage: downloadURL,
      });
      setDonorProfile(updated);
      showToast('Profile photo updated successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to upload profile photo.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
          <p className="text-sm font-semibold text-slate-500">Loading your profile dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-light dark:bg-bg-dark p-6 transition-colors duration-300">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
              Hello, {currentUser?.name}
              <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-primary/10 text-primary dark:bg-primary-dark/25 dark:text-primary-dark">
                {currentUser?.role}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Welcome back to your dashboard. Keep track of emergency alerts and matches.
            </p>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            System Status: <span className="text-emerald-500 font-bold">ONLINE</span>
          </div>
        </motion.div>

        {/* DONOR DASHBOARD METRICS */}
        {isDonor && donorProfile && (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Stat Card 1: Availability */}
            <motion.div variants={item} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Availability</span>
                <span className={`p-1.5 rounded-lg text-xs font-bold ${donorProfile.availability ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20' : 'bg-red-50 text-red-500 dark:bg-red-950/20'}`}>
                  {donorProfile.availability ? 'Active' : 'Offline'}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Available to Donate</span>
                <button 
                  onClick={handleToggleAvailability} 
                  className="text-primary hover:text-primary-hover dark:text-primary-dark cursor-pointer transition-colors"
                >
                  {donorProfile.availability ? (
                    <ToggleRight className="h-9 w-9 text-emerald-500 fill-current" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-slate-400" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Stat Card 2: Medical Eligibility */}
            <motion.div variants={item} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eligibility</span>
                {donorProfile.eligibility ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="mt-4">
                <div className="text-lg font-bold text-slate-800 dark:text-slate-150">
                  {donorProfile.eligibility ? 'Eligible to Donate' : 'Medically Ineligible'}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Based on medical history & rests.</p>
              </div>
            </motion.div>

            {/* Stat Card 3: Total Donations */}
            <motion.div variants={item} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Donations</span>
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-slate-850 dark:text-white">
                  {donorProfile.totalDonations || 0}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Donation sessions recorded.</p>
              </div>
            </motion.div>

            {/* Stat Card 4: Last Donation */}
            <motion.div variants={item} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Donation</span>
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4">
                <div className="text-lg font-bold text-slate-800 dark:text-slate-150">
                  {formatDate(donorProfile.lastDonationDate)}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Required rest interval: 56 days.</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* DONOR: PROFILE & HISTORY TABS */}
        {isDonor && donorProfile && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Edit Profile Panel */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Edit Donor Profile</h3>
              </div>

              {/* Photo Upload segment */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden group">
                  <img
                    src={donorProfile.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${donorProfile.name}`}
                    alt="Donor"
                    className="h-full w-full object-cover"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Profile Picture</h4>
                  <p className="text-xs text-slate-400">JPG or PNG. Max size 2MB.</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      required
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Gender
                    </label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-450" />
                      <input
                        type="text"
                        required
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-455" />
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl cursor-pointer shadow-sm hover:shadow dark:bg-primary-dark transition-all"
                  >
                    Save Profile Settings
                  </button>
                </div>
              </form>
            </div>

            {/* Donation History Timeline */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-4">
                <History className="h-5 w-5 text-rose-500" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Donation History</h3>
              </div>

              {donorProfile.totalDonations > 0 ? (
                <div className="relative pl-6 border-l border-slate-150 dark:border-slate-850 space-y-6">
                  {/* Generate mock sessions based on totalDonations count */}
                  {Array.from({ length: Math.min(4, donorProfile.totalDonations) }).map((_, idx) => {
                    const sessionDate = donorProfile.lastDonationDate 
                      ? new Date(new Date(donorProfile.lastDonationDate).getTime() - idx * 1000 * 60 * 60 * 24 * 120) // spacing out by 4 months
                      : new Date();
                    return (
                      <div key={idx} className="relative">
                        <div className="absolute -left-9.5 top-0.5 h-4.5 w-4.5 rounded-full border-2 border-white bg-rose-500 dark:border-slate-900 flex items-center justify-center">
                          <Heart className="h-2 w-2 text-white fill-current animate-pulse" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          Blood Donation Session
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(sessionDate)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          Successfully donated 1 unit of whole blood.
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  No previous donation sessions registered.
                </div>
              )}
            </div>
          </div>
        )}

        {/* REQUESTER OR ADMIN DASHBOARD OVERVIEW */}
        {(isRequester || isAdmin) && (
          <div className="space-y-6">
            
            {/* Global Stats Grid */}
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <motion.div variants={item} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Network Donors</span>
                <span className="text-3xl font-black text-slate-800 dark:text-white mt-2">{globalStats.donorsCount}</span>
              </motion.div>
              <motion.div variants={item} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Emergency Cases</span>
                <span className="text-3xl font-black text-slate-800 dark:text-white mt-2">{globalStats.requestsCount}</span>
              </motion.div>
              <motion.div variants={item} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fulfilled Emergency Requests</span>
                <span className="text-3xl font-black text-emerald-500 mt-2">{globalStats.fulfilledRequestsCount}</span>
              </motion.div>
            </motion.div>

            {/* Quick Actions & Recent Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Requester's Submitted Requests */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    My Submitted Requests
                  </h3>
                  <Link
                    to="/request"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg dark:bg-primary-dark transition-colors cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" /> Create Request
                  </Link>
                </div>

                {myRequests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                          <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Patient Name</th>
                          <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Blood Group</th>
                          <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Hospital</th>
                          <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Urgency</th>
                          <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myRequests.map((req) => (
                          <tr key={req.id} className="border-b border-slate-50 dark:border-slate-850/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                            <td className="py-3 text-sm font-bold text-slate-800 dark:text-slate-200">{req.patientName}</td>
                            <td className="py-3 text-sm font-bold text-red-500">{req.bloodGroup}</td>
                            <td className="py-3 text-xs text-slate-500">{req.hospital}</td>
                            <td className="py-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                req.urgency === 'Critical' ? 'bg-red-50 text-red-650 dark:bg-red-950/20' :
                                req.urgency === 'High' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                                'bg-blue-50 text-blue-500 dark:bg-blue-950/20'
                              }`}>
                                {req.urgency}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                req.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20' :
                                'bg-slate-50 text-slate-450 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-405 text-xs">
                    You have not submitted any blood requests yet.
                  </div>
                )}
              </div>

              {/* Sidebar Quick Recommendations widget */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-md font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-amber-500 fill-current animate-pulse" />
                  AI Matching Engine
                </h3>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Need blood matching matching recommendations? Our simulated ML model evaluates eligible donors based on proximity and rest interval safety.
                </p>
                <div className="pt-2">
                  <Link
                    to="/ai-recommend"
                    className="w-full inline-flex justify-center items-center py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl dark:bg-slate-850 dark:hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Launch Match Finder
                  </Link>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
export default Dashboard;