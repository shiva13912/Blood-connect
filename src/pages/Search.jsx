import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';
import { exportToCSV, exportToPDF, formatDate } from '../utils/helpers';
import { debounce } from '../utils/performance';
import { 
  Search as SearchIcon, MapPin, Phone, Mail, Award, CheckCircle, 
  XCircle, Filter, Download, FileSpreadsheet, Send, User, ChevronLeft, ChevronRight 
} from 'lucide-react';

export const Search = () => {
  const { showToast } = useToast();
  
  // Data State (real-time via Firestore onSnapshot)
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlood, setFilterBlood] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterAvailability, setFilterAvailability] = useState('All');
  const [filterEligibility, setFilterEligibility] = useState('All');

  // Sorting State
  const [sortBy, setSortBy] = useState('name');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show more items per page

  // Contact Drawer State
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Lists of unique values
  const [cities, setCities] = useState([]);

  useEffect(() => {
    setLoading(true);
    const unsub = api.subscribeDonors((data) => {
      setDonors(data);
      setCities([...new Set(data.map((d) => d.city).filter(Boolean))]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Memoize filtered & sorted donors to avoid recalculation on every render
  const filteredDonors = useMemo(() => {
    return donors
      .filter((donor) => {
        const matchSearch = donor.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchBlood = filterBlood === 'All' || donor.bloodGroup === filterBlood;
        const matchCity = filterCity === 'All' || donor.city.toLowerCase() === filterCity.toLowerCase();
        
        const matchAvail =
          filterAvailability === 'All' ||
          (filterAvailability === 'Available' && donor.availability) ||
          (filterAvailability === 'Unavailable' && !donor.availability);

        const matchElig =
          filterEligibility === 'All' ||
          (filterEligibility === 'Eligible' && donor.eligibility) ||
          (filterEligibility === 'Ineligible' && !donor.eligibility);

        return matchSearch && matchBlood && matchCity && matchAvail && matchElig;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'age') return a.age - b.age;
        if (sortBy === 'donations') return (b.totalDonations || 0) - (a.totalDonations || 0);
        return 0;
      });
  }, [donors, searchQuery, filterBlood, filterCity, filterAvailability, filterEligibility, sortBy]);

  // Pagination index computations
  const totalPages = Math.ceil(filteredDonors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDonors = filteredDonors.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleContactDonor = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      showToast('Please type a notification message first.', 'warning');
      return;
    }

    setSendingMessage(true);
    try {
      // Create a real notification for the donor
      const notification = {
        recipientId: selectedDonor.id,
        recipientEmail: selectedDonor.email,
        recipientName: selectedDonor.name,
        type: 'direct_alert',
        title: `⚠️ Urgent Blood Alert`,
        message: messageText,
        requestData: {
          fromName: selectedDonor.name,
          contactNumber: selectedDonor.phone,
        },
      };
      await api.addNotification(notification);
      showToast(`Urgent alert sent to ${selectedDonor.name}!`, 'success');
      setSelectedDonor(null);
      setMessageText('');
    } catch (error) {
      console.error(error);
      showToast('Failed to send alert. Please try again.', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
          <p className="text-sm font-semibold text-slate-500">Querying active donors database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-light dark:bg-bg-dark p-6 transition-colors duration-300">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
              Blood Donor Directory
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Search and filter active donors registered in the BloodConnect network.
            </p>
          </div>
          
          {/* Export Panel */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => exportToCSV(filteredDonors)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-sm cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Export Excel (CSV)
            </button>
            <button
              onClick={() => exportToPDF(filteredDonors)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-sm cursor-pointer transition-colors"
            >
              <Download className="h-4 w-4 text-red-500" /> Export PDF Report
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 pb-3 border-b border-slate-100 dark:border-slate-850">
            <Filter className="h-4 w-4 text-primary" /> Filter Directory
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Search Name</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter name..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark"
                />
              </div>
            </div>

            {/* Blood type */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Blood Group</label>
              <select
                value={filterBlood}
                onChange={(e) => { setFilterBlood(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="All">All Blood Groups</option>
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">City Location</label>
              <select
                value={filterCity}
                onChange={(e) => { setFilterCity(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="All">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Availability</label>
              <select
                value={filterAvailability}
                onChange={(e) => { setFilterAvailability(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sort Directory</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="name">Name (Alphabetical)</option>
                <option value="age">Age (Ascending)</option>
                <option value="donations">Total Donations (Highest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donors Grid */}
        {currentDonors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDonors.map((donor) => (
              <div
                key={donor.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                {/* Blood Group Tag Overlay */}
                <div className="absolute top-0 right-0 h-14 w-14 bg-red-500/10 dark:bg-red-500/20 text-red-500 font-black text-lg flex items-center justify-center rounded-bl-3xl">
                  {donor.bloodGroup}
                </div>

                <div className="space-y-4">
                  {/* Photo & Name */}
                  <div className="flex items-center gap-3">
                    <img
                      src={donor.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${donor.name}`}
                      alt={donor.name}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 pr-10 truncate">{donor.name}</h4>
                      <p className="text-xs text-slate-400">{donor.age} yrs &bull; {donor.gender}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      donor.availability 
                        ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20' 
                        : 'bg-red-50 text-red-500 dark:bg-red-950/20'
                    }`}>
                      {donor.availability ? 'Available' : 'Unavailable'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      donor.eligibility 
                        ? 'bg-emerald-55 bg-emerald-500/5 text-emerald-500' 
                        : 'bg-red-55 bg-red-500/5 text-red-500'
                    }`}>
                      {donor.eligibility ? 'Eligible' : 'Ineligible'}
                    </span>
                  </div>

                  {/* Metadata fields */}
                  <div className="space-y-1.5 pt-2 text-xs text-slate-500 dark:text-slate-450 border-t border-slate-50 dark:border-slate-850">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{donor.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-slate-400" />
                      <span>{donor.totalDonations || 0} donations (Last: {formatDate(donor.lastDonationDate)})</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-50 dark:border-slate-850 flex gap-2">
                  <button
                    onClick={() => setSelectedDonor(donor)}
                    className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl dark:bg-primary-dark transition-colors shadow-sm cursor-pointer text-center"
                  >
                    Contact Donor
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center text-slate-400 text-xs shadow-sm">
            No donors found matching the active filter criteria.
          </div>
        )}

        {/* Pagination controls */}
        {filteredDonors.length > 0 && (
          <div className="flex flex-col items-center justify-center gap-4 pt-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </button>
              <span className="text-xs text-slate-450 font-semibold">
                Page {currentPage} of {totalPages} ({filteredDonors.length} donors)
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            
          </div>
        )}

        {/* Contact Drawer Modal */}
        {selectedDonor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl relative space-y-6">
              
              <div>
                <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Contact Donor
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Send an SMS/Email notification alert simulated request.
                </p>
              </div>

              {/* Profile Card Summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center gap-3">
                <img
                  src={selectedDonor.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedDonor.name}`}
                  alt={selectedDonor.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">{selectedDonor.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-450 mt-0.5">
                    <span className="text-red-500 font-extrabold">{selectedDonor.bloodGroup}</span>
                    <span>&bull;</span>
                    <span>{selectedDonor.phone || 'No Phone'}</span>
                  </div>
                </div>
              </div>

              {/* Notification Message form */}
              <form onSubmit={handleContactDonor} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Emergency Alert Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={`Hello ${selectedDonor.name}, we urgently need your ${selectedDonor.bloodGroup} blood donation at City General Hospital...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedDonor(null); setMessageText(''); }}
                    className="w-1/2 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingMessage}
                    className="w-1/2 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl dark:bg-primary-dark transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {sendingMessage ? 'Dispatching...' : 'Send Alert'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default Search;