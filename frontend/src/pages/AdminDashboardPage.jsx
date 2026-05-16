// -----------------------------------------
// Admin Dashboard Page
// Platform analytics and user management
// Clicking a user navigates to their history
// -----------------------------------------
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup, HiOutlineCube, HiOutlineCurrencyRupee,
  HiOutlineClock, HiOutlineTrash, HiOutlineChatBubbleLeftRight,
  HiOutlineEye,
} from 'react-icons/hi2';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getAllUsers(),
      ]);
      setAnalytics(analyticsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all their data? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser(id);
      toast.success('User deleted successfully.');
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user.';
      toast.error(message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading admin panel..." />;

  const userColumns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <button
          onClick={() => navigate(`/admin/users/${row._id}`)}
          className="text-primary-600 hover:text-primary-700 font-medium hover:underline text-left"
        >
          {row.name}
        </button>
      ),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <span className={row.role === 'admin' ? 'badge-info' : 'badge-success'}>
          {row.role}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/users/${row._id}`)}
            className="p-1.5 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="View history"
          >
            <HiOutlineEye className="w-4 h-4" />
          </button>
          {row.role !== 'admin' && (
            <button
              onClick={() => handleDeleteUser(row._id, row.name)}
              className="p-1.5 rounded-lg text-surface-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete user"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Monthly revenue chart data
  const revenueChartData = (analytics?.monthlyRevenue || []).map((item) => ({
    month: item._id,
    revenue: item.totalRevenue || 0,
  }));

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-800">Admin Dashboard</h1>
        <p className="text-sm text-surface-500 mt-1">Platform overview and user management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={<HiOutlineUserGroup className="w-5 h-5" />}
          label="Total Users"
          value={analytics?.totalUsers || 0}
          color="primary"
        />
        <StatsCard
          icon={<HiOutlineCube className="w-5 h-5" />}
          label="Production Entries"
          value={analytics?.totalProduction || 0}
          color="purple"
        />
        <StatsCard
          icon={<HiOutlineCurrencyRupee className="w-5 h-5" />}
          label="Total Revenue"
          value={`Rs. ${analytics?.totalRevenue || 0}`}
          color="green"
        />
        <StatsCard
          icon={<HiOutlineChatBubbleLeftRight className="w-5 h-5" />}
          label="Pending Support"
          value={analytics?.pendingSupportRequests || 0}
          color="amber"
        />
      </div>

      {/* Revenue Chart */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-surface-800 mb-4">Monthly Revenue</h2>
        {revenueChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Legend />
              <Bar dataKey="revenue" fill="#0c8ee8" name="Revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-surface-400 text-center py-8">No revenue data available yet.</p>
        )}
      </div>

      {/* User Management */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-800">User Management</h2>
          <p className="text-sm text-surface-500">{users.length} registered users</p>
        </div>
        <DataTable
          columns={userColumns}
          data={users}
          emptyIcon={<HiOutlineUserGroup className="w-8 h-8" />}
          emptyTitle="No users found"
          emptyDescription="No users have registered yet."
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
