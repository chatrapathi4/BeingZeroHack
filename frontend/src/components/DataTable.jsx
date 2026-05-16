// -----------------------------------------
// Data Table Component
// Reusable table with empty state handling
// -----------------------------------------
import EmptyState from './EmptyState';

const DataTable = ({ columns, data, emptyIcon, emptyTitle, emptyDescription }) => {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle || 'No data found'}
        description={emptyDescription || 'Start by adding your first entry.'}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-4 font-semibold text-surface-600 whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row._id || index}
              className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 text-surface-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
