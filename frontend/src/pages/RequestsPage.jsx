// -----------------------------------------
// Requests Page (User side)
// Send and track support requests
// -----------------------------------------
import { useState, useEffect } from 'react';
import supportService from '../services/supportService';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineChatBubbleLeftRight, HiOutlinePlus } from 'react-icons/hi2';

const initialFormState = {
  subject: '',
  message: '',
  category: 'other',
};

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await supportService.getMyRequests();
      setRequests(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch support requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      toast.error('Please provide subject and message.');
      return;
    }

    setSubmitting(true);
    try {
      await supportService.createRequest(formData);
      toast.success('Support request submitted successfully.');
      setModalOpen(false);
      setFormData(initialFormState);
      fetchRequests();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit request.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
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
      label: 'Submitted',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN'),
    },
    {
      key: 'message',
      label: 'Message',
      render: (row) => (
        <span className="text-surface-500 truncate max-w-[200px] inline-block">
          {row.message}
        </span>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading support requests..." />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Support Requests</h1>
          <p className="text-sm text-surface-500 mt-1">Send and track support requests</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span className="hidden sm:inline">New Request</span>
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <p className="text-sm font-medium text-surface-500">Total Requests</p>
          <p className="text-xl font-bold text-surface-800 mt-1">{requests.length}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-surface-500">Pending</p>
          <p className="text-xl font-bold text-amber-600 mt-1">
            {requests.filter((r) => r.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={requests}
          emptyIcon={<HiOutlineChatBubbleLeftRight className="w-8 h-8" />}
          emptyTitle="No support requests yet"
          emptyDescription="Need help? Submit a new support request."
        />
      </div>

      {/* New Request Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Support Request"
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief description of your issue"
            required
          />
          <div className="mb-4">
            <label className="label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
            >
              <option value="payment">Payment</option>
              <option value="production">Production</option>
              <option value="technical">Technical</option>
              <option value="other">Other</option>
            </select>
          </div>
          <FormInput
            label="Message"
            type="textarea"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Describe your issue in detail"
            required
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RequestsPage;
