// -----------------------------------------
// Auth Layout
// Centered card layout for login/register pages
// -----------------------------------------
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-surface-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold text-surface-800">Smart Artisan</h1>
            <p className="text-sm text-surface-500 mt-1">Assistant</p>
          </Link>
        </div>

        {/* Auth card */}
        <div className="bg-white rounded-2xl shadow-lg border border-surface-200 p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-surface-400 mt-6">
          Smart Artisan Assistant - Manage your craft business
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
