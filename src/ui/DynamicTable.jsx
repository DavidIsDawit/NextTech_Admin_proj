import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./table";

function DynamicTable({ columns, rows }) {
    return (
        <div className="rounded-md border bg-white overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[70vh] no-scrollbar">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead
                                    key={col.key}
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 sticky top-0 z-10"
                                >
                                    {col.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, rowIndex) => (
                            <TableRow
                                key={row.id || row._id || rowIndex}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                {columns.map((col) => (
                                    <TableCell
                                        key={col.key}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {col.render ? col.render(row[col.key], row) : row[col.key] ?? "-"}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {rows.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No records found.
                    </div>
                )}
            </div>
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
