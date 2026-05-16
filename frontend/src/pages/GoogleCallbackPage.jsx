// -----------------------------------------
// Google OAuth Callback Page
// Handles redirect from Google OAuth flow
// Extracts token from URL and logs user in
// -----------------------------------------
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      loginWithToken(token).then(() => {
        navigate('/dashboard');
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner message="Completing Google login..." />
    </div>
  );
};

export default GoogleCallbackPage;
