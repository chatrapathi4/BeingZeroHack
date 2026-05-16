// -----------------------------------------
// Stats Card Component
// Displays a metric with icon, label, and value
// Used on dashboard pages
// -----------------------------------------
const StatsCard = ({ icon, label, value, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card-hover animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500">{label}</p>
          <p className="text-2xl font-bold text-surface-800 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last week
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
