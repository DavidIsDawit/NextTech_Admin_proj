import { useState, useMemo } from "react";
import { FiPlus, FiEye, FiTrash2 } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import DynamicTable from "../DynamicTable";
import DynamicDropdown from "../DynamicDropdown";
import DynamicButton from "../DynamicButton";
import DynamicSearch from "../DynamicSearch";
import Pagination from "../Pagination";
import Badge from "../Badge";
import { CertificatesData } from "../../data/CertificatesData";
import { exportToCSV } from "../../utils/csvExport";

function CertificateList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const types = useMemo(() => ["All Types", ...new Set(CertificatesData.map(s => s.type))], []);
    const statuses = useMemo(() => ["All Status", ...new Set(CertificatesData.map(s => s.status))], []);

    const filteredData = useMemo(() => {
        return CertificatesData.filter((item) => {
            const matchesSearch = item.certificate.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === "All Types" || item.type === typeFilter;
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [searchTerm, typeFilter, statusFilter]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExportCSV = () => {
        exportToCSV(filteredData, "Certificates", {
            certificate: "Certificate Name",
            type: "Type",
            issueDate: "Issue Date",
            from: "From",
            status: "Status"
        });
    };

    // Columns: Preview,  certificate, type , issue date,  from , status, action
    const columns = [
        {
            key: "preview",
            label: "Preview",
            render: (value, row) => <div className="flex-shrink-0 h-16 w-24"><img src={value} alt={row.certificate} className="h-full w-full rounded object-cover border border-gray-200" /></div>,
        },
        {
            key: "certificate",
            label: "Certificate Name",
            render: (value) => <div className="font-medium text-gray-900">{value}</div>,
        },
        {
            key: "type",
            label: "Type",
            render: (value) => <span className="text-sm text-gray-700">{value}</span>,
        },
        {
            key: "issueDate",
            label: "Issue Date",
            render: (value) => <div className="text-sm text-gray-500">{value}</div>,
        },
        {
            key: "from",
            label: "From",
            render: (value) => <div className="text-sm text-gray-700">{value}</div>,
        },
        {
            key: "status",
            label: "Status",
            render: (value) => <Badge type={value}>{value}</Badge>,
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <div className="flex items-center space-x-3">
                    <button
                        className="p-1 text-gray-400 hover:text-gray-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                        onClick={() => console.log("View", row.id)}
                        title="View"
                    >
                        <FiEye size={21} />
                    </button>
                    <button
                        className="p-1 text-gray-400 hover:text-gray-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                        onClick={() => console.log("Edit", row.id)}
                        title="Edit"
                    >
                        <BiEdit size={21} />
                    </button>
                    <button
                        className="p-1 text-red-300 hover:text-red-500 rounded border border-red-100 hover:bg-red-50 transition-colors"
                        onClick={() => console.log("Delete", row.id)}
                        title="Delete"
                    >
                        <FiTrash2 size={21} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-0 md:px-5 lg:px-2 2xl:px-5 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl lg:text-3xl 2xl:text-4xl font-bold text-gray-900">
                        Certificate Management
                    </h1>
                    <p className="text-base text-gray-500 mt-3">
                        Manage certifications and awards
                    </p>
                </div>
                <DynamicButton
                    icon={FiPlus}
                    onClick={() => console.log("Add New")}
                    className="w-full sm:w-auto md:w-52 lg:w-52 xl:w-52 md:h-12 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                >
                    Add New Certificate
                </DynamicButton>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-12">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
                    <div className="w-full sm:w-96 lg:w-80 2xl:w-96">
                        <DynamicSearch
                            value={searchTerm}
                            onChange={(val) => {
                                setSearchTerm(val);
                                setCurrentPage(1);
                            }}
                            placeholder="Search certificates..."
                        />
                    </div>
                    <div className="w-full sm:w-40">
                        <DynamicDropdown
                            options={types.filter((s) => s !== "All Types")}
                            value={typeFilter}
                            onChange={(val) => {
                                setTypeFilter(val);
                                setCurrentPage(1);
                            }}
                            defaultOption="All Types"
                        />
                    </div>
                    <div className="w-full sm:w-36">
                        <DynamicDropdown
                            options={statuses.filter((s) => s !== "All Status")}
                            value={statusFilter}
                            onChange={(val) => {
                                setStatusFilter(val);
                                setCurrentPage(1);
                            }}
                            defaultOption="All Status"
                        />
                    </div>
                </div>
                <DynamicButton
                    variant="secondary"
                    onClick={handleExportCSV}
                    className="w-full sm:w-auto justify-center sm:justify-end text-sm font-medium"
                >
                    Export CSV
                </DynamicButton>
            </div>

            <div>
                <DynamicTable columns={columns} rows={currentData} />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center md:px-8 gap-4 pt-2">
                <div className="text-sm text-gray-500 order-2 sm:order-1">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {filteredData.length > 0
                            ? (currentPage - 1) * itemsPerPage + 1
                            : 0}
                    </span>
                    -
                    <span className="font-medium text-gray-900">
                        {Math.min(currentPage * itemsPerPage, filteredData.length)}
                    </span>{" "}
                    of <span className="font-medium text-gray-900">{filteredData.length}</span>{" "}
                    certificates
                </div>
                <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => setCurrentPage(p)}
                    />
                </div>
            </div>
        </div>

    );
}

export default CertificateList;
