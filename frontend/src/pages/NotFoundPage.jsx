// -----------------------------------------
// 404 Not Found Page
// -----------------------------------------
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-surface-300 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-surface-700 mb-2">Page Not Found</h2>
        <p className="text-sm text-surface-500 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
