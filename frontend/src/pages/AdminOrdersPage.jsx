import { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await adminService.getAllOrders();
        setOrders(res.data.data);
      } catch (error) {
        toast.error('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      o.customerName?.toLowerCase().includes(s) ||
      o.productName?.toLowerCase().includes(s) ||
      o.userId?.name?.toLowerCase().includes(s)
    );
  });

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-surface-700">{row.userId?.name || 'Unknown'}</p>
          <p className="text-xs text-surface-400">{row.userId?.email || ''}</p>
        </div>
      ),
    },
    { key: 'customerName', label: 'Customer' },
    { key: 'productName', label: 'Product' },
    { key: 'quantity', label: 'Qty' },
    {
      key: 'total',
      label: 'Total',
      render: (row) => `Rs. ${row.sellingPrice * row.quantity}`,
    },
    {
      key: 'workStatus',
      label: 'Work',
      render: (row) => (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          row.workStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {row.workStatus === 'completed' ? '✓ Done' : '⏳ Pending'}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (row) => (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          row.paymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {row.paymentStatus === 'completed' ? '✓ Paid' : '⏳ Pending'}
        </span>
      ),
    },
    {
      key: 'linked',
      label: 'Auto-Created',
      render: (row) => (
        <div className="flex gap-1">
          {row.productionEntryCreated && <span className="badge-info text-xs">Production</span>}
          {row.paymentEntryCreated && <span className="badge-success text-xs">Payment</span>}
          {!row.productionEntryCreated && !row.paymentEntryCreated && <span className="text-xs text-surface-400">—</span>}
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString('en-IN'),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-800">All Orders</h1>
        <p className="text-sm text-surface-500 mt-1">View all user orders and linked records</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user, customer, or product..."
          className="input-field pl-9 w-full"
        />
      </div>

      {/* Table */}
      <div className="w-full">
        <DataTable
          columns={columns}
          data={filteredOrders}
          emptyIcon={<HiOutlineClipboardDocumentList className="w-8 h-8" />}
          emptyTitle="No orders"
          emptyDescription="No orders have been created yet."
        />
      </div>
    </div>
  );
};

export default AdminOrdersPage;
