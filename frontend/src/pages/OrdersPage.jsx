import { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  HiOutlineClipboardDocumentList,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';

const initialFormState = {
  customerName: '',
  productName: '',
  quantity: '',
  sellingPrice: '',
  productCost: '',
  date: new Date().toISOString().split('T')[0],
  materialsUsed: '',
  notes: '',
  workStatus: 'pending',
  paymentStatus: 'pending',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterWork, setFilterWork] = useState('');
  const [filterPayment, setFilterPayment] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await orderService.getAll();
      setOrders(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setModalOpen(true);
  };

  const openEditModal = (order) => {
    setEditingId(order._id);
    setFormData({
      customerName: order.customerName,
      productName: order.productName,
      quantity: order.quantity.toString(),
      sellingPrice: order.sellingPrice.toString(),
      productCost: order.productCost.toString(),
      date: new Date(order.date).toISOString().split('T')[0],
      materialsUsed: order.materialsUsed || '',
      notes: order.notes || '',
      workStatus: order.workStatus,
      paymentStatus: order.paymentStatus,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.productName || !formData.quantity || !formData.sellingPrice || !formData.productCost) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        sellingPrice: Number(formData.sellingPrice),
        productCost: Number(formData.productCost),
      };

      if (editingId) {
        await orderService.update(editingId, payload);
        toast.success('Order updated successfully.');
      } else {
        await orderService.create(payload);
        toast.success('Order created successfully.');
      }
      setModalOpen(false);
      fetchOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await orderService.delete(id);
      toast.success('Order deleted.');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to delete order.');
    }
  };

  const handleStatusToggle = async (order, field) => {
    const newStatus = order[field] === 'pending' ? 'completed' : 'pending';

    // Prevent toggling back after auto-creation
    if (field === 'workStatus' && order.productionEntryCreated && newStatus === 'pending') {
      toast.error('Cannot revert work status — production entry already created.');
      return;
    }
    if (field === 'paymentStatus' && order.paymentEntryCreated && newStatus === 'pending') {
      toast.error('Cannot revert payment status — payment entry already created.');
      return;
    }

    try {
      await orderService.update(order._id, { [field]: newStatus });
      if (field === 'workStatus' && newStatus === 'completed') {
        toast.success('Work completed — production entry auto-created!');
      } else if (field === 'paymentStatus' && newStatus === 'completed') {
        toast.success('Payment completed — payment entry auto-created!');
      } else {
        toast.success('Status updated.');
      }
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  // Filter and search
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase());
    const matchWork = !filterWork || o.workStatus === filterWork;
    const matchPayment = !filterPayment || o.paymentStatus === filterPayment;
    return matchSearch && matchWork && matchPayment;
  });

  const columns = [
    { key: 'customerName', label: 'Customer' },
    { key: 'productName', label: 'Product' },
    { key: 'quantity', label: 'Qty' },
    {
      key: 'sellingPrice',
      label: 'Price',
      render: (row) => `Rs. ${row.sellingPrice}`,
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => `Rs. ${row.sellingPrice * row.quantity}`,
    },
    {
      key: 'workStatus',
      label: 'Work',
      render: (row) => (
        <button
          onClick={() => handleStatusToggle(row, 'workStatus')}
          className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
            row.workStatus === 'completed'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          {row.workStatus === 'completed' ? '✓ Done' : '⏳ Pending'}
        </button>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (row) => (
        <button
          onClick={() => handleStatusToggle(row, 'paymentStatus')}
          className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
            row.paymentStatus === 'completed'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          {row.paymentStatus === 'completed' ? '✓ Paid' : '⏳ Pending'}
        </button>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString('en-IN'),
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

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  const pendingWork = orders.filter((o) => o.workStatus === 'pending').length;
  const pendingPayment = orders.filter((o) => o.paymentStatus === 'pending').length;

  return (
    <div className="animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Orders</h1>
          <p className="text-sm text-surface-500 mt-1">Manage customer orders</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Order</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card py-3 px-4">
          <p className="text-xs font-medium text-surface-500">Total</p>
          <p className="text-lg font-bold text-surface-800">{orders.length}</p>
        </div>
        <div className="card py-3 px-4">
          <p className="text-xs font-medium text-surface-500">Work Pending</p>
          <p className="text-lg font-bold text-amber-600">{pendingWork}</p>
        </div>
        <div className="card py-3 px-4">
          <p className="text-xs font-medium text-surface-500">Payment Pending</p>
          <p className="text-lg font-bold text-amber-600">{pendingPayment}</p>
        </div>
        <div className="card py-3 px-4">
          <p className="text-xs font-medium text-surface-500">Completed</p>
          <p className="text-lg font-bold text-emerald-600">
            {orders.filter((o) => o.workStatus === 'completed' && o.paymentStatus === 'completed').length}
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer or product..."
            className="input-field pl-9 w-full"
          />
        </div>
        <select value={filterWork} onChange={(e) => setFilterWork(e.target.value)} className="input-field w-auto">
          <option value="">All Work</option>
          <option value="pending">Work Pending</option>
          <option value="completed">Work Done</option>
        </select>
        <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="input-field w-auto">
          <option value="">All Payment</option>
          <option value="pending">Payment Pending</option>
          <option value="completed">Payment Done</option>
        </select>
      </div>

      {/* Table */}
      <div className="w-full">
        <DataTable
          columns={columns}
          data={filteredOrders}
          emptyIcon={<HiOutlineClipboardDocumentList className="w-8 h-8" />}
          emptyTitle="No orders yet"
          emptyDescription="Start by adding your first customer order."
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Order' : 'Add New Order'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="e.g., Ravi Kumar" required />
            <FormInput label="Product Name" name="productName" value={formData.productName} onChange={handleChange} placeholder="e.g., Handwoven Basket" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Quantity" type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="0" required />
            <FormInput label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Selling Price (Rs.)" type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} placeholder="0" required />
            <FormInput label="Product Cost (Rs.)" type="number" name="productCost" value={formData.productCost} onChange={handleChange} placeholder="0" required />
          </div>
          <FormInput label="Materials Used" name="materialsUsed" value={formData.materialsUsed} onChange={handleChange} placeholder="e.g., Bamboo, thread, dye" />
          <FormInput label="Notes" type="textarea" name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional notes" />

          {/* Status toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label">Work Status</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, workStatus: 'pending' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    formData.workStatus === 'pending'
                      ? 'bg-amber-100 border-amber-300 text-amber-700'
                      : 'bg-surface-50 border-surface-200 text-surface-500 hover:bg-surface-100'
                  }`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, workStatus: 'completed' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    formData.workStatus === 'completed'
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-surface-50 border-surface-200 text-surface-500 hover:bg-surface-100'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
            <div>
              <label className="label">Payment Status</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentStatus: 'pending' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    formData.paymentStatus === 'pending'
                      ? 'bg-amber-100 border-amber-300 text-amber-700'
                      : 'bg-surface-50 border-surface-200 text-surface-500 hover:bg-surface-100'
                  }`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentStatus: 'completed' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    formData.paymentStatus === 'completed'
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-surface-50 border-surface-200 text-surface-500 hover:bg-surface-100'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

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

export default OrdersPage;
