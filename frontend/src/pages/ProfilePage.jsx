// -----------------------------------------
// Profile Page
// View and edit user profile
// -----------------------------------------
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FormInput from '../components/FormInput';
import toast from 'react-hot-toast';
import { HiOutlineUser } from 'react-icons/hi2';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/auth/profile', formData);
      updateUser(res.data.data);
      toast.success('Profile updated successfully.');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-800">Profile</h1>
        <p className="text-sm text-surface-500 mt-1">Manage your account settings</p>
      </div>

      <div className="max-w-lg">
        <div className="card">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-surface-200">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <HiOutlineUser className="w-8 h-8 text-primary-600" />
              )}
            </div>
            <div>
              <p className="font-semibold text-surface-800">{user?.name}</p>
              <p className="text-sm text-surface-500">{user?.email}</p>
              <span className={user?.role === 'admin' ? 'badge-info mt-1' : 'badge-success mt-1'}>
                {user?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
          </div>

          {/* Edit form */}
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
            <FormInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

            <div className="flex items-center gap-3 mt-2">
              <p className="text-xs text-surface-400">
                Account created: {new Date(user?.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-6 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
