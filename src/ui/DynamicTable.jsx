import PropTypes from 'prop-types';

function DynamicTable({ columns, rows }) {
    return (
        <div className="bg-white rounded-t-lg overflow-x-auto overflow-y-auto max-h-[70vh] no-scrollbar">
            <table className="min-w-full divide-y divide-gray-200 box-border">
                {/* Sticky Header - NEVER scrolls */}
                <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Body - ONLY this part scrolls */}
                <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row, rowIndex) => (
                        <tr
                            key={row.id || row._id || rowIndex}
                            className="hover:bg-gray-50 transition-colors"
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? "-"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {rows.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No records found.
                </div>
            )}
        </div>
    );
}

DynamicTable.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            render: PropTypes.func,
        })
    ).isRequired,
    rows: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DynamicTable;
