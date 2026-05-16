// -----------------------------------------
// Production Page
// CRUD management for production entries
// -----------------------------------------
import { useState, useEffect } from 'react';
import productionService from '../services/productionService';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineCube, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';

const initialFormState = {
  productName: '',
  quantity: '',
  materialsUsed: '',
  productionCost: '',
  sellingPrice: '',
  notes: '',
  date: new Date().toISOString().split('T')[0],
};

const ProductionPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all entries
  const fetchEntries = async () => {
    try {
      const res = await productionService.getAll();
      setEntries(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch production entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setModalOpen(true);
  };

  const openEditModal = (entry) => {
    setEditingId(entry._id);
    setFormData({
      productName: entry.productName,
      quantity: entry.quantity.toString(),
      materialsUsed: entry.materialsUsed || '',
      productionCost: entry.productionCost.toString(),
      sellingPrice: entry.sellingPrice.toString(),
      notes: entry.notes || '',
      date: new Date(entry.date).toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName || !formData.quantity || !formData.productionCost || !formData.sellingPrice) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        productionCost: Number(formData.productionCost),
        sellingPrice: Number(formData.sellingPrice),
      };

      if (editingId) {
        await productionService.update(editingId, payload);
        toast.success('Entry updated successfully.');
      } else {
        await productionService.create(payload);
        toast.success('Entry created successfully.');
      }
      setModalOpen(false);
      fetchEntries();
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await productionService.delete(id);
      toast.success('Entry deleted successfully.');
      fetchEntries();
    } catch (error) {
      toast.error('Failed to delete entry.');
    }
  };

  const columns = [
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
      key: 'profit',
      label: 'Profit',
      render: (row) => {
        const profit = (row.sellingPrice - row.productionCost) * row.quantity;
        return (
          <span className={profit >= 0 ? 'text-emerald-600' : 'text-red-500'}>
            Rs. {profit}
          </span>
        );
      },
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

  if (loading) return <LoadingSpinner message="Loading production entries..." />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Production</h1>
          <p className="text-sm text-surface-500 mt-1">Manage your production entries</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Entry</span>
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={entries}
          emptyIcon={<HiOutlineCube className="w-8 h-8" />}
          emptyTitle="No production entries yet"
          emptyDescription="Start by adding your first production entry."
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Production Entry' : 'Add Production Entry'}
      >
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <FormInput label="Product Name" name="productName" value={formData.productName} onChange={handleChange} placeholder="e.g., Handwoven Basket" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Quantity" type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="0" required />
            <FormInput label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Production Cost (Rs.)" type="number" name="productionCost" value={formData.productionCost} onChange={handleChange} placeholder="0" required />
            <FormInput label="Selling Price (Rs.)" type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} placeholder="0" required />
          </div>
          <FormInput label="Materials Used" name="materialsUsed" value={formData.materialsUsed} onChange={handleChange} placeholder="e.g., Bamboo, thread, dye" />
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

export default ProductionPage;
