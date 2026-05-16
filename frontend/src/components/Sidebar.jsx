// -----------------------------------------
// Sidebar Component
// Navigation sidebar with separate links for user/admin
// Collapsible on mobile
// -----------------------------------------
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineCurrencyRupee,
  HiOutlineChartBar,
  HiOutlineSparkles,
  HiOutlineUser,
  HiOutlineUserGroup,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowLeftOnRectangle,
} from 'react-icons/hi2';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();

  // Navigation items for regular users
  const userNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { to: '/production', label: 'Production', icon: HiOutlineCube },
    { to: '/payments', label: 'Payments', icon: HiOutlineCurrencyRupee },
    { to: '/reports', label: 'Reports', icon: HiOutlineChartBar },
    { to: '/ai-analyzer', label: 'AI Analyzer', icon: HiOutlineSparkles },
    { to: '/requests', label: 'Support', icon: HiOutlineChatBubbleLeftRight },
    { to: '/profile', label: 'Profile', icon: HiOutlineUser },
  ];

  // Admin sees a different, focused navigation
  const adminNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { to: '/admin', label: 'Users', icon: HiOutlineUserGroup },
    { to: '/admin/support', label: 'Support Requests', icon: HiOutlineChatBubbleLeftRight },
    { to: '/profile', label: 'Profile', icon: HiOutlineUser },
  ];

  // Admin gets their own nav, users get theirs
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-50 text-primary-700 shadow-sm'
        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-surface-200 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-surface-200">
            <h1 className="text-lg font-bold text-surface-800">
              Smart Artisan
            </h1>
            <p className="text-xs text-surface-500 mt-0.5">Assistant</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClasses}
                onClick={onClose}
                end={item.to === '/admin'}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User info + Logout */}
          <div className="px-3 py-4 border-t border-surface-200">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-800 truncate">{user?.name}</p>
                <p className="text-xs text-surface-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <HiOutlineArrowLeftOnRectangle className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
