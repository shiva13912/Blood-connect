import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { getAIRecommendations } from '../utils/aiModel';
import { useToast } from '../components/common/Toast';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Brain, Sparkles, MapPin, Droplet, Award, CheckCircle, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export const AiRecommendation = () => {
  const { showToast } = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [city, setCity] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [cities, setCities] = useState([]);

  useEffect(() => { fetchDonors(); }, []);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const data = await api.getDonors();
      setDonors(data);
      const uniqueCities = [...new Set(data.map(d => d.city).filter(Boolean))];
      setCities(uniqueCities);
      if (uniqueCities.length) setCity(uniqueCities[0]);
    } catch (e) {
      console.error(e);
      showToast('Failed to load donors for AI evaluation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiEvaluation = (e) => {
    e.preventDefault();
    if (!bloodGroup || !city) {
      showToast('Please specify blood group and target city.', 'warning');
      return;
    }
    const matches = getAIRecommendations(donors, bloodGroup, city);
    setRecommendations(matches);
    setHasSearched(true);
    showToast(`AI analysis complete: Found ${matches.length} compatible candidates.`, 'success');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250';
    if (score >= 60) return 'text-primary bg-primary/10 dark:bg-primary-dark/20 border-primary-dark/30';
    if (score >= 45) return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-250';
    return 'text-slate-500 bg-slate-50 dark:bg-slate-900 border-slate-200';
  };

  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-primary dark:bg-primary-dark';
    if (score >= 45) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const scoreChartData = {
    labels: ['0-19', '20-39', '40-59', '60-79', '80-100'],
    datasets: [{
      label: 'Donors',
      data: [
        recommendations.filter(r => r.matchScore < 20).length,
        recommendations.filter(r => r.matchScore >= 20 && r.matchScore < 40).length,
        recommendations.filter(r => r.matchScore >= 40 && r.matchScore < 60).length,
        recommendations.filter(r => r.matchScore >= 60 && r.matchScore < 80).length,
        recommendations.filter(r => r.matchScore >= 80).length,
      ],
      backgroundColor: ['#94A3B8','#F59E0B','#3B82F6','#2563EB','#10B981'],
      borderRadius: 6,
    }]
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
          <p className="text-sm font-semibold text-slate-500">Initializing AI recommendation engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-light dark:bg-bg-dark p-6 transition-colors duration-300">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm gap-4"
        >
          <div>
            <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              AI Donor Recommendation Space
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Locate high-probability responders using machine learning matching heuristics.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <form onSubmit={handleRunAiEvaluation} className="flex flex-col md:flex-row gap-5 items-end justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Target Patient Blood Group
                </label>
                <div className="relative">
                  <Droplet className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                    {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Hospital City/Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <select value={city} onChange={e => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button type="submit"
              className="w-full md:w-auto px-6 py-3.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl dark:bg-primary-dark transition-colors shadow-lg shadow-primary/15 flex items-center justify-center gap-2 cursor-pointer">
              <Sparkles className="h-4.5 w-4.5" /> Run AI Match Evaluation
            </button>
          </form>
        </motion.div>

        {hasSearched ? (
          recommendations.length > 0 ? (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { icon: CheckCircle, color: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20', label: 'Top Match Score', value: `${recommendations[0]?.matchScore}%` },
                  { icon: Activity, color: 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark', label: 'Response Likelihood', value: recommendations[0]?.likelihood },
                  { icon: Sparkles, color: 'bg-amber-50 text-amber-500 dark:bg-amber-950/20', label: 'Matched Candidates', value: `${recommendations.length} donors` },
                ].map((s, i) => (
                  <motion.div key={i} variants={item} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                    <div className={`p-3 rounded-xl ${s.color}`}><s.icon className="h-6 w-6" /></div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</h4>
                      <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{s.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {recommendations.length > 2 && (
                <motion.div variants={item} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Score Distribution</h3>
                  <div className="h-48"><Bar data={scoreChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {recommendations.map((donor, idx) => (
                  <motion.div key={donor.id} variants={item}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 transition-all hover:shadow-md">
                    <div className="flex gap-4 items-start md:w-1/3">
                      <img src={donor.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${donor.name}`} alt={donor.name}
                        className="h-12 w-12 rounded-xl object-cover ring-2 ring-primary/10" />
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                          {donor.name}
                          <span className="text-[10px] font-black text-red-500 px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/20">{donor.bloodGroup}</span>
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-450 font-medium">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{donor.city}</span><span>&bull;</span>
                          <span className="flex items-center gap-1"><Award className="h-3 w-3" />{donor.totalDonations} donations</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Email: {donor.email}</p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>AI Match Diagnostics</span><span className="text-slate-400">Decision Reasons</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                        {donor.reasons?.map((reason, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 mt-0.5 font-bold">&bull;</span><span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 md:w-1/4 min-w-[150px]">
                      <div className={`p-4 rounded-2xl border text-center ${getScoreColor(donor.matchScore)} w-full`}>
                        <span className="block text-[10px] uppercase font-bold tracking-wider opacity-75">Probability Score</span>
                        <span className="block text-3xl font-black tracking-tight mt-1">{donor.matchScore}%</span>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                          <div className={`h-full ${getProgressColor(donor.matchScore)}`} style={{ width: `${donor.matchScore}%` }} />
                        </div>
                        <span className="block text-[10px] font-bold mt-2.5">Likelihood: {donor.likelihood}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-12 rounded-2xl text-center text-slate-400 text-xs shadow-sm">
              No recommended donors match this blood type compatibility in the selected city.
            </motion.div>
          )
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-16 rounded-2xl text-center text-slate-450 text-xs shadow-sm space-y-3">
            <Brain className="h-12 w-12 mx-auto text-primary/30" />
            <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">Run the AI Match Maker to analyze candidates.</p>
            <p className="max-w-md mx-auto text-slate-400 text-[11px]">Specify a target blood group and destination city, and click evaluating options above to parse match profiles.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
export default AiRecommendation;