// -----------------------------------------
// Admin User History Page
// Detailed view of a specific user's activity
// -----------------------------------------
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  HiOutlineCube,
  HiOutlineCurrencyRupee,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowLeft,
  HiOutlineUser,
} from 'react-icons/hi2';

const AdminUserHistoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await adminService.getUserHistory(id);
        setData(res.data.data);
      } catch (error) {
        toast.error('Failed to load user history.');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id, navigate]);

  if (loading) return <LoadingSpinner message="Loading user history..." />;
  if (!data) return null;

  const { user, summary, recentProductions, recentPayments, recentSupportRequests } = data;

  const productionColumns = [
    { key: 'productName', label: 'Product' },
    { key: 'quantity', label: 'Qty' },
    {
      key: 'productionCost',
      label: 'Cost',
      render: (row) => `Rs. ${row.productionCost}`,
    },
    {
      key: 'sellingPrice',
      label: 'Price',
      render: (row) => `Rs. ${row.sellingPrice}`,
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString('en-IN'),
    },
  ];

  const paymentColumns = [
    { key: 'customerName', label: 'Customer' },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => `Rs. ${row.amount}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={row.status === 'received' ? 'badge-success' : 'badge-warning'}>
          {row.status === 'received' ? 'Received' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'paymentDate',
      label: 'Date',
      render: (row) => new Date(row.paymentDate).toLocaleDateString('en-IN'),
    },
  ];

  const supportColumns = [
    { key: 'subject', label: 'Subject' },
    {
      key: 'category',
      label: 'Category',
      render: (row) => <span className="badge-info capitalize">{row.category}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={row.status === 'resolved' ? 'badge-success' : 'badge-warning'}>
          {row.status === 'resolved' ? 'Resolved' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN'),
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Back button + Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 transition-colors mb-4"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to Users
        </button>
        <h1 className="text-2xl font-bold text-surface-800">User History</h1>
      </div>

      {/* User info card */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <HiOutlineUser className="w-7 h-7 text-primary-600" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-surface-800">{user.name}</h2>
            <p className="text-sm text-surface-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={user.role === 'admin' ? 'badge-info' : 'badge-success'}>
                {user.role}
              </span>
              <span className="text-xs text-surface-400">
                Joined {new Date(user.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={<HiOutlineCube className="w-5 h-5" />}
          label="Total Productions"
          value={summary.totalProductions}
          color="primary"
        />
        <StatsCard
          icon={<HiOutlineCurrencyRupee className="w-5 h-5" />}
          label="Total Earnings"
          value={`Rs. ${summary.totalEarnings}`}
          color="green"
        />
        <StatsCard
          icon={<HiOutlineCurrencyRupee className="w-5 h-5" />}
          label="Total Payments"
          value={summary.totalPayments}
          color="amber"
        />
        <StatsCard
          icon={<HiOutlineChatBubbleLeftRight className="w-5 h-5" />}
          label="Support Requests"
          value={summary.totalSupportRequests}
          color="purple"
        />
      </div>

      {/* Recent Productions */}
      <div className="card p-0 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-800">Recent Production Entries</h2>
        </div>
        <DataTable
          columns={productionColumns}
          data={recentProductions}
          emptyIcon={<HiOutlineCube className="w-8 h-8" />}
          emptyTitle="No production entries"
          emptyDescription="This user has no production entries yet."
        />
      </div>

      {/* Payment History */}
      <div className="card p-0 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-800">Payment History</h2>
        </div>
        <DataTable
          columns={paymentColumns}
          data={recentPayments}
          emptyIcon={<HiOutlineCurrencyRupee className="w-8 h-8" />}
          emptyTitle="No payments"
          emptyDescription="This user has no payment records yet."
        />
      </div>

      {/* Support Request History */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-800">Support Request History</h2>
        </div>
        <DataTable
          columns={supportColumns}
          data={recentSupportRequests}
          emptyIcon={<HiOutlineChatBubbleLeftRight className="w-8 h-8" />}
          emptyTitle="No support requests"
          emptyDescription="This user has no support requests yet."
        />
      </div>
    </div>
  );
};

export default AdminUserHistoryPage;
