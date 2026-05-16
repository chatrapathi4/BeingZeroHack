// -----------------------------------------
// Loading Spinner Component
// Displayed while data is being fetched
// -----------------------------------------
const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`${sizeClasses[size]} border-3 border-surface-200 border-t-primary-600 rounded-full animate-spin`}
        style={{ borderWidth: '3px' }}
      />
      {message && (
        <p className="mt-3 text-sm text-surface-500">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
