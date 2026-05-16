// -----------------------------------------
// Reports Page
// Weekly/monthly summaries with charts
// -----------------------------------------
import { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#0c8ee8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ReportsPage = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [weeklyRes, monthlyRes] = await Promise.all([
          reportService.getWeeklySummary(),
          reportService.getMonthlySummary(),
        ]);
        setWeeklyData(weeklyRes.data.data);
        setMonthlyData(monthlyRes.data.data);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <LoadingSpinner message="Loading reports..." />;

  // Process monthly production for chart
  const monthlyChartData = (monthlyData?.monthlyProduction || []).map((item) => ({
    month: item._id,
    revenue: item.totalRevenue || 0,
    cost: item.totalCost || 0,
    profit: item.profit || 0,
    quantity: item.totalQuantity || 0,
  }));

  // Process weekly production for chart
  const weeklyChartData = (weeklyData?.dailyProduction || []).map((item) => ({
    day: item._id,
    quantity: item.totalQuantity || 0,
    revenue: item.totalRevenue || 0,
    cost: item.totalCost || 0,
  }));

  // Top products
  const topProducts = monthlyData?.topProducts || [];

  // Calculate totals
  const totalRevenue = monthlyChartData.reduce((sum, m) => sum + m.revenue, 0);
  const totalCost = monthlyChartData.reduce((sum, m) => sum + m.cost, 0);
  const totalProfit = totalRevenue - totalCost;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-800">Reports</h1>
        <p className="text-sm text-surface-500 mt-1">Analyze your business performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <p className="text-sm font-medium text-surface-500">Total Revenue</p>
          <p className="text-xl font-bold text-primary-600 mt-1">Rs. {totalRevenue}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-surface-500">Total Expenses</p>
          <p className="text-xl font-bold text-red-500 mt-1">Rs. {totalCost}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-surface-500">Total Profit</p>
          <p className={`text-xl font-bold mt-1 ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            Rs. {totalProfit}
          </p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-surface-800 mb-4">Weekly Production</h2>
        {weeklyChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Legend />
              <Line type="monotone" dataKey="quantity" stroke="#0c8ee8" name="Quantity" strokeWidth={2} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-surface-400 text-center py-8">No weekly data available.</p>
        )}
      </div>

      {/* Monthly Chart */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-surface-800 mb-4">Monthly Summary</h2>
        {monthlyChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Legend />
              <Bar dataKey="revenue" fill="#0c8ee8" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" fill="#f59e0b" name="Cost" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-surface-400 text-center py-8">No monthly data available.</p>
        )}
      </div>

      {/* Top Products */}
      <div className="card">
        <h2 className="text-lg font-semibold text-surface-800 mb-4">Most Produced Products</h2>
        {topProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={topProducts} dataKey="totalQuantity" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label={({ _id }) => _id}>
                  {topProducts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product._id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm font-medium text-surface-700">{product._id}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-800">{product.totalQuantity} units</p>
                    <p className="text-xs text-surface-500">Rs. {product.totalRevenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-surface-400 text-center py-8">No products data available yet.</p>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
