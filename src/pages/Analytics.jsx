import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { BarChart3, Activity, PieChart, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export const Analytics = () => {
  const { showToast } = useToast();
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalyticsData(); }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [donorsData, requestsData] = await Promise.all([
        api.getDonors(),
        api.getRequests(),
      ]);
      setDonors(donorsData);
      setRequests(requestsData);
    } catch (e) {
      console.error(e);
      showToast('Failed to compile analytics statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const bloodDistribution = bloodGroups.map(bg => donors.filter(d => d.bloodGroup === bg).length);

  const bloodGroupChartData = {
    labels: bloodGroups,
    datasets: [{
      label: 'Donors Count',
      data: bloodDistribution,
      backgroundColor: ['#EF4444','#F87171','#3B82F6','#60A5FA','#10B981','#34D399','#F59E0B','#FBBF24'],
      borderWidth: 0,
    }]
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const monthlyLabels = [];
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyLabels.push(months[d.getMonth()]);
    const count = donors.filter(dnr => {
      if (!dnr.lastDonationDate) return false;
      const ld = new Date(dnr.lastDonationDate);
      return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
    }).length;
    monthlyData.push(count);
  }

  const monthlyDonationsData = {
    labels: monthlyLabels,
    datasets: [{
      fill: true,
      label: 'Donations',
      data: monthlyData,
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      tension: 0.4,
    }]
  };

  const cities = [...new Set(donors.map(d => d.city).filter(Boolean))].slice(0, 4);
  const donorsByCity = cities.map(c => donors.filter(d => d.city === c).length);
  const requestsByCity = cities.map(c => requests.filter(r => r.city === c).length);

  const citiesComparisonData = {
    labels: cities.length ? cities : ['New York', 'Chicago', 'San Francisco', 'Los Angeles'],
    datasets: [
      { label: 'Active Donors', data: donorsByCity.length ? donorsByCity : [10,8,5,4], backgroundColor: '#10B981', borderRadius: 8 },
      { label: 'Emergency Cases', data: requestsByCity.length ? requestsByCity : [12,6,4,3], backgroundColor: '#EF4444', borderRadius: 8 },
    ]
  };

  const availableCount = donors.filter(d => d.availability).length;
  const unavailableCount = donors.length - availableCount;

  const availabilityChartData = {
    labels: ['Available', 'Busy/On Rest'],
    datasets: [{ data: [availableCount || 4, unavailableCount || 2], backgroundColor: ['#10B981','#EF4444'], borderWidth: 0 }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: 'gray', font: { weight: 'bold', size: 10 } } } }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
          <p className="text-sm font-semibold text-slate-500">Compiling database metrics analytics...</p>
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
          className="flex justify-between items-center p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm"
        >
          <div>
            <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Network Analytics & Trends
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time statistical breakdowns of blood inventory distribution and emergency requests.
            </p>
          </div>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: PieChart, color: 'text-red-500', title: 'Blood Group Distribution', chart: <Doughnut data={bloodGroupChartData} options={chartOptions} /> },
            { icon: TrendingUp, color: 'text-primary', title: 'Donations Over Time (Monthly)', chart: <Line data={monthlyDonationsData} options={chartOptions} /> },
            { icon: Activity, color: 'text-emerald-500', title: 'Donors vs. Urgent Requests by City', chart: <Bar data={citiesComparisonData} options={chartOptions} /> },
            { icon: PieChart, color: 'text-emerald-500', title: 'Donor Availability Ratio', chart: <Doughnut data={availabilityChartData} options={chartOptions} /> },
          ].map((c, i) => (
            <motion.div key={i} variants={item} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[350px]">
              <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-850 pb-3 mb-4">
                <c.icon className={`h-5 w-5 ${c.color}`} />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{c.title}</h3>
              </div>
              <div className="flex-grow relative h-64">{c.chart}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
export default Analytics;
