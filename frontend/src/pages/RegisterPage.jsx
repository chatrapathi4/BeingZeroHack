// -----------------------------------------
// Register Page
// User registration with Google OAuth option
// -----------------------------------------
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import FormInput from '../components/FormInput';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Account created successfully.');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      await googleLogin({
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub,
        avatar: decoded.picture,
      });
      toast.success('Google sign-up successful.');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Google sign-up failed.';
      toast.error(message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-800 mb-1">Create an account</h2>
      <p className="text-sm text-surface-500 mb-6">Start managing your artisan business</p>

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
        <FormInput
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Minimum 6 characters"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-surface-200" />
        <span className="text-xs text-surface-400">or</span>
        <div className="flex-1 h-px bg-surface-200" />
      </div>

      {/* Google Login */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google sign-up failed.')}
          text="signup_with"
          shape="rectangular"
        />
      </div>

      {/* Login link */}
      <p className="text-sm text-surface-500 text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
