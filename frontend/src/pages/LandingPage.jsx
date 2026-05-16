// -----------------------------------------
// Landing Page
// Public homepage with hero, features, and CTA
// -----------------------------------------
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineCube,
  HiOutlineCurrencyRupee,
  HiOutlineChartBar,
  HiOutlineSparkles,
} from 'react-icons/hi2';

const features = [
  {
    icon: HiOutlineCube,
    title: 'Production Tracking',
    desc: 'Log and manage every product you create with detailed cost tracking.',
  },
  {
    icon: HiOutlineCurrencyRupee,
    title: 'Payment Management',
    desc: 'Track received and pending payments from your customers.',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Reports & Analytics',
    desc: 'Weekly and monthly reports with visual charts and insights.',
  },
  {
    icon: HiOutlineSparkles,
    title: 'AI Product Analyzer',
    desc: 'Upload product images to get AI-powered quality and pricing suggestions.',
  },
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-surface-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-surface-800">Smart Artisan Assistant</h1>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-sm">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-surface-900 leading-tight">
            Manage Your Craft Business with Ease
          </h2>
          <p className="text-lg text-surface-500 mt-5 leading-relaxed">
            A simple and powerful tool for local artisans to track production,
            manage payments, analyze products, and grow their business.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="btn-primary px-6 py-3 text-base"
            >
              Start for Free
            </Link>
            <a href="#features" className="btn-secondary px-6 py-3 text-base">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-surface-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-surface-800 text-center mb-12">
            Everything You Need to Run Your Business
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="card-hover text-center">
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-surface-800 mb-2">{feature.title}</h4>
                <p className="text-sm text-surface-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-surface-400">
            Smart Artisan Assistant. Built for artisans.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
