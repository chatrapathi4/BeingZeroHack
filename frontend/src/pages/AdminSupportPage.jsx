// -----------------------------------------
// Admin Support Page
// View and manage all support requests
// -----------------------------------------
import { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckCircle,
  HiOutlineEye,
} from 'react-icons/hi2';

const AdminSupportPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await adminService.getAllSupportRequests(statusFilter);
      setRequests(res.data.data);
    } catch (error) {
      toast.error('Failed to load support requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchRequests();
  }, [statusFilter]);

  const handleResolve = async (id) => {
    try {
      await adminService.updateSupportRequest(id, { status: 'resolved' });
      toast.success('Request marked as resolved.');
      fetchRequests();
      // Update detail view if open
      if (selectedRequest?._id === id) {
        setSelectedRequest((prev) => ({ ...prev, status: 'resolved' }));
      }
    } catch (error) {
      toast.error('Failed to update request.');
    }
  };

  const openDetail = (request) => {
    setSelectedRequest(request);
    setDetailOpen(true);
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-surface-700">
            {row.userId?.name || 'Unknown'}
          </p>
          <p className="text-xs text-surface-400">{row.userId?.email || ''}</p>
        </div>
      ),
    },
    { key: 'subject', label: 'Subject' },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="badge-info capitalize">{row.category}</span>
      ),
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
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openDetail(row)}
            className="p-1.5 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="View details"
          >
            <HiOutlineEye className="w-4 h-4" />
          </button>
          {row.status === 'pending' && (
            <button
              onClick={() => handleResolve(row._id)}
              className="p-1.5 rounded-lg text-surface-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Mark as resolved"
            >
              <HiOutlineCheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading support requests..." />;

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-800">Support Requests</h1>
        <p className="text-sm text-surface-500 mt-1">
          Manage support requests from users
        </p>
      </div>

      {/* Summary + Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-4">
          <div className="card py-3 px-5">
            <p className="text-xs font-medium text-surface-500">Total</p>
            <p className="text-lg font-bold text-surface-800">{requests.length}</p>
          </div>
          <div className="card py-3 px-5">
            <p className="text-xs font-medium text-surface-500">Pending</p>
            <p className="text-lg font-bold text-amber-600">{pendingCount}</p>
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={requests}
          emptyIcon={<HiOutlineChatBubbleLeftRight className="w-8 h-8" />}
          emptyTitle="No support requests"
          emptyDescription="No support requests match the current filter."
        />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-4">
            {/* User info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-50">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold">
                {selectedRequest.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-surface-800">
                  {selectedRequest.userId?.name || 'Unknown User'}
                </p>
                <p className="text-xs text-surface-500">
                  {selectedRequest.userId?.email || ''}
                </p>
              </div>
            </div>

            {/* Request details */}
            <div>
              <p className="text-xs font-medium text-surface-500 mb-1">Subject</p>
              <p className="text-sm text-surface-800 font-medium">{selectedRequest.subject}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-xs font-medium text-surface-500 mb-1">Category</p>
                <span className="badge-info capitalize">{selectedRequest.category}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-surface-500 mb-1">Status</p>
                <span className={selectedRequest.status === 'resolved' ? 'badge-success' : 'badge-warning'}>
                  {selectedRequest.status === 'resolved' ? 'Resolved' : 'Pending'}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-surface-500 mb-1">Submitted</p>
                <p className="text-sm text-surface-700">
                  {new Date(selectedRequest.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-surface-500 mb-1">Message</p>
              <p className="text-sm text-surface-700 bg-surface-50 rounded-lg p-3 whitespace-pre-wrap">
                {selectedRequest.message}
              </p>
            </div>

            {/* Resolve action */}
            {selectedRequest.status === 'pending' && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    handleResolve(selectedRequest._id);
                    setDetailOpen(false);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  Mark as Resolved
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminSupportPage;
