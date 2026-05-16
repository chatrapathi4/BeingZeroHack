// -----------------------------------------
// Payments Page
// CRUD management for payment records
// -----------------------------------------
import { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineCurrencyRupee, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';

const initialFormState = {
  customerName: '',
  amount: '',
  status: 'pending',
  paymentDate: new Date().toISOString().split('T')[0],
  notes: '',
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    try {
      const res = await paymentService.getAll();
      setPayments(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch payment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setModalOpen(true);
  };

  const openEditModal = (payment) => {
    setEditingId(payment._id);
    setFormData({
      customerName: payment.customerName,
      amount: payment.amount.toString(),
      status: payment.status,
      paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
      notes: payment.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.amount) {
      toast.error('Please fill in customer name and amount.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData, amount: Number(formData.amount) };

      if (editingId) {
        await paymentService.update(editingId, payload);
        toast.success('Payment updated successfully.');
      } else {
        await paymentService.create(payload);
        toast.success('Payment created successfully.');
      }
      setModalOpen(false);
      fetchPayments();
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    try {
      await paymentService.delete(id);
      toast.success('Payment deleted successfully.');
      fetchPayments();
    } catch (error) {
      toast.error('Failed to delete payment.');
    }
  };

  const columns = [
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
    {
      key: 'notes',
      label: 'Notes',
      render: (row) => (
        <span className="text-surface-500 truncate max-w-[150px] inline-block">
          {row.notes || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Edit"
          >
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1.5 rounded-lg text-surface-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading payments..." />;

  // Calculate totals
  const totalReceived = payments.filter((p) => p.status === 'received').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Payments</h1>
          <p className="text-sm text-surface-500 mt-1">Track your customer payments</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Payment</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <p className="text-sm font-medium text-surface-500">Total Received</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">Rs. {totalReceived}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-surface-500">Total Pending</p>
          <p className="text-xl font-bold text-amber-600 mt-1">Rs. {totalPending}</p>
        </div>
      </div>

      {/* Table */}
      <div className="w-full">
        <DataTable
          columns={columns}
          data={payments}
          emptyIcon={<HiOutlineCurrencyRupee className="w-8 h-8" />}
          emptyTitle="No payment records yet"
          emptyDescription="Start by adding your first payment record."
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Payment' : 'Add Payment'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <FormInput label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Customer name" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Amount (Rs.)" type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="0" required />
            <FormInput label="Date" type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} required />
          </div>
          <div className="mb-4">
            <label className="label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="pending">Pending</option>
              <option value="received">Received</option>
            </select>
          </div>
          <FormInput label="Notes" type="textarea" name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional notes" />

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentsPage;
