// -----------------------------------------
// Dashboard Page
// Shows key stats, weekly summary, and monthly chart
// -----------------------------------------
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import reportService from '../services/reportService';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  HiOutlineCube,
  HiOutlineCurrencyRupee,
  HiOutlineClock,
  HiOutlineChartBar,
} from 'react-icons/hi2';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, monthlyRes] = await Promise.all([
          reportService.getDashboardStats(),
          reportService.getMonthlySummary(),
        ]);
        setStats(dashRes.data.data);

        // Format monthly data for chart
        const formatted = (monthlyRes.data.data.monthlyProduction || []).map((item) => ({
          month: item._id,
          revenue: item.totalRevenue || 0,
          cost: item.totalCost || 0,
          profit: item.profit || 0,
        }));
        setMonthlyData(formatted);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-800">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Here is an overview of your artisan business.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={<HiOutlineCurrencyRupee className="w-5 h-5" />}
          label="Total Earnings"
          value={formatCurrency(stats?.totalEarnings)}
          color="green"
        />
        <StatsCard
          icon={<HiOutlineCube className="w-5 h-5" />}
          label="Products Made"
          value={stats?.totalProducts || 0}
          color="primary"
        />
        <StatsCard
          icon={<HiOutlineClock className="w-5 h-5" />}
          label="Pending Payments"
          value={formatCurrency(stats?.pendingPayments)}
          color="amber"
        />
        <StatsCard
          icon={<HiOutlineChartBar className="w-5 h-5" />}
          label="Production Entries"
          value={stats?.entryCount || 0}
          color="purple"
        />
      </div>

      {/* Weekly summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <p className="text-sm font-medium text-surface-500 mb-1">This Week - Products</p>
          <p className="text-xl font-bold text-surface-800">
            {stats?.weekly?.production?.totalProducts || 0}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-surface-500 mb-1">This Week - Revenue</p>
          <p className="text-xl font-bold text-emerald-600">
            {formatCurrency(stats?.weekly?.production?.totalRevenue)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-surface-500 mb-1">This Week - Cost</p>
          <p className="text-xl font-bold text-red-500">
            {formatCurrency(stats?.weekly?.production?.totalCost)}
          </p>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="card">
        <h2 className="text-lg font-semibold text-surface-800 mb-4">Monthly Overview</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#0c8ee8" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" fill="#f59e0b" name="Cost" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-surface-400 text-center py-8">
            No monthly data available yet. Start adding production entries to see charts.
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
