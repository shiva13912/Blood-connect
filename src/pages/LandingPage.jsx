import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';
import { 
  Droplet, Activity, Search, ShieldCheck, Heart, 
  MapPin, Phone, Hospital, AlertCircle, Sparkles 
} from 'lucide-react';

export const LandingPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Quick Request Widget state
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    hospital: '',
    city: '',
    contactNumber: '',
    urgency: 'Critical',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickRequest = async (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.hospital || !formData.city || !formData.contactNumber) {
      showToast('Please fill in all fields for the emergency request.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReq = await api.addRequest({
        ...formData,
        status: 'Pending',
        createdBy: currentUser?.email || 'anonymous',
      });
      showToast('Emergency request submitted successfully! Donors are being evaluated.', 'success');
      
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
      // Route to requests overview if logged in
      if (currentUser) {
        navigate('/request');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to submit emergency request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statItems = [
    { label: 'Active Donors', value: '450+', icon: Heart, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
    { label: 'Saved Lives', value: '1,200+', icon: Droplet, color: 'text-primary bg-primary/10 dark:bg-primary-dark/20' },
    { label: 'Response Rate', value: '98%', icon: Activity, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'AI Accuracy', value: '94%', icon: Sparkles, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl dark:bg-primary-dark/5 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-secondary/15 blur-3xl dark:bg-secondary-dark/5 pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Brand */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 dark:bg-primary-dark/15 border border-primary/20 dark:border-primary-dark/30 text-primary dark:text-primary-dark text-xs font-bold uppercase tracking-wider"
              >
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                AI-Powered Emergency response
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white"
              >
                Connecting Lives Through{' '}
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent dark:from-primary-dark dark:to-secondary-dark">
                  Intelligent
                </span>{' '}
                Blood Donation
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-slate-600 dark:text-slate-350 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                AI-powered donor matching and emergency blood request management platform. Find eligible donors matching your city and blood group in seconds.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3"
              >
                <Link
                  to={currentUser ? "/search" : "/login"}
                  className="px-6 py-3.5 rounded-xl bg-primary text-sm font-bold text-white hover:bg-primary-hover shadow-lg shadow-primary/20 dark:bg-primary-dark dark:hover:bg-primary-dark/90 transition-all transform hover:-translate-y-0.5"
                >
                  Find Donors
                </Link>
                <Link
                  to={currentUser ? "/profile" : "/register"}
                  className="px-6 py-3.5 rounded-xl border border-slate-350 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-all transform hover:-translate-y-0.5"
                >
                  Become a Donor
                </Link>
              </motion.div>
            </div>

            {/* Right Hero: Quick Emergency Widget */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 relative"
              >
                <div className="absolute top-0 right-0 p-3 bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400 rounded-bl-2xl rounded-tr-2xl text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 animate-ping" />
                  Urgent Need
                </div>

                <div className="mb-5">
                  <h3 className="text-xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-red-500 fill-current" />
                    Quick Emergency Request
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Submit a query to parse active matching profiles.
                  </p>
                </div>

                <form onSubmit={handleQuickRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
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
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
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
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
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
                      <Hospital className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. City General Hospital"
                        value={formData.hospital}
                        onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        City
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. New York"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Contact Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +1 555-0100"
                          value={formData.contactNumber}
                          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-red-500 hover:bg-red-650 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/10 hover:shadow-red-550/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? 'Submitting request...' : 'Publish Emergency Request'}
                  </button>
                </form>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-12 bg-white dark:bg-slate-950 border-y border-slate-200/80 dark:border-slate-900 transition-colors duration-250">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statItems.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-bg-light dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50"
                >
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">{stat.value}</p>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Why Choose BloodConnect AI?
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Our smart network cuts matching down from hours to minutes, giving dispatchers and families a direct channel to willing local donors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">AI Matching Algorithms</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Calculates compatible blood types, geographic distances, and donation rest intervals, yielding precise donor likelihood ratings.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center justify-center mb-6">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Granular Filters</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Locate exactly who you need by filtering blood groups, cities, eligibility thresholds, and instant availability toggles.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-450 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Regulatory Validation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Adheres strictly to the 56-day whole blood donation resting period to safeguard the health and well-being of our donors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              How It Works
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Simple, fast, and life-saving. Get connected with donors in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Create Request', description: 'Post your emergency blood requirement with patient details' },
              { step: 2, title: 'AI Match', description: 'Our algorithm finds eligible donors in real-time' },
              { step: 3, title: 'Notify Donors', description: 'Matching donors receive instant notifications' },
              { step: 4, title: 'Connect', description: 'Get in touch and arrange the donation immediately' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative"
              >
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-primary to-secondary dark:from-primary-dark dark:to-secondary-dark text-white font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:flex absolute top-1/3 -right-3 items-center justify-center">
                    <div className="text-2xl text-slate-300 dark:text-slate-700">→</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Benefits Grid */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary-dark/10 dark:to-secondary-dark/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              Key Features
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Everything you need for efficient, safe, and immediate blood donation coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: AlertCircle, title: 'Real-Time Alerts', description: 'Donors get instant notifications with all emergency request details' },
              { icon: Activity, title: 'Health & Safety', description: 'Automatic eligibility checks based on donation history and guidelines' },
              { icon: MapPin, title: 'Location-Based', description: 'Find donors in your area with precise geographic matching' },
              { icon: Heart, title: 'Community Driven', description: 'Build a network of verified, trusted local blood donors' },
              { icon: ShieldCheck, title: 'Verified Profiles', description: 'All donors verified and compliant with health regulations' },
              { icon: Droplet, title: 'Emergency Priority', description: 'Critical requests get priority handling and multiple notifications' }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-4"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {[
              {
                q: 'Is my blood type information safe?',
                a: 'Yes, we use industry-standard encryption and comply with HIPAA guidelines. Your personal health information is never shared without explicit consent.'
              },
              {
                q: 'How do donors get notified?',
                a: 'Donors receive in-app notifications, push notifications, and emails when there\'s an emergency request matching their blood type and location.'
              },
              {
                q: 'What blood types can I donate?',
                a: 'All blood types are critical. O- is the universal donor, but every type is needed. Check your blood type with your local blood bank.'
              },
              {
                q: 'How often can I donate?',
                a: 'Whole blood can be donated every 56 days (8 weeks). Our system automatically calculates your eligibility based on donation history.'
              },
              {
                q: 'Can I use this as a requester without being a donor?',
                a: 'Yes! Requesters can post emergency blood needs. We recommend being part of the donor community for better social impact.'
              },
              {
                q: 'Is BloodConnect AI certified?',
                a: 'We adhere to all health and safety regulations. Always verify donor eligibility through official medical channels before accepting blood.'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800"
              >
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">{item.q}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary to-secondary dark:from-primary-dark dark:to-secondary-dark">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to Save Lives Today?
            </h2>
            <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
              Join thousands of donors and requesters in our community. Every donation, every connection, matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                to={currentUser ? "/request" : "/register"}
                className="px-8 py-3.5 rounded-xl bg-white text-primary dark:text-primary-dark font-bold hover:shadow-lg transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
              >
                <AlertCircle className="h-5 w-5" />
                {currentUser ? 'Post Emergency Request' : 'Get Started Now'}
              </Link>
              <Link
                to={currentUser ? "/search" : "/login"}
                className="px-8 py-3.5 rounded-xl border-2 border-white text-white font-bold hover:bg-white/10 transition-all"
              >
                {currentUser ? 'Search Donors' : 'Sign In'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-slate-50/50 dark:bg-slate-950/30 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Community Testimonials</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80">
              <p className="text-sm italic text-slate-500 dark:text-slate-400 mb-4">
                "During my father's emergency heart surgery, we needed A- negative blood urgently. Within minutes of publishing our request on BloodConnect AI, three local donors received notifications and confirmed. The platform is a lifesaver."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-650 text-sm">
                  ME
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Maria E.</h4>
                  <p className="text-[10px] text-slate-400">Requester, Chicago</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80">
              <p className="text-sm italic text-slate-500 dark:text-slate-400 mb-4">
                "I've been a donor for 5 years, but often had no idea when local banks needed my blood type. The AI algorithm checks my rest window and alerts me when someone nearby is in critical need. It makes donating feel direct and impactful."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-650 text-sm">
                  DK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Daniel K.</h4>
                  <p className="text-[10px] text-slate-400">O+ Donor, New York</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;