import { useState, useMemo } from "react";
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import DynamicTable from "../DynamicTable";
import DynamicDropdown from "../DynamicDropdown";
import DynamicButton from "../DynamicButton";
import DynamicSearch from "../DynamicSearch";
import Pagination from "../Pagination";
import Badge from "../Badge";
import { mockServices } from "../../data/mockServices";

function Services() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const categories = useMemo(() => ["All Categories", ...new Set(mockServices.map(s => s.category))], []);
    const statuses = useMemo(() => ["All Status", ...new Set(mockServices.map(s => s.status))], []);

    // Filter Logic
    const filteredServices = useMemo(() => {
        return mockServices.filter((service) => {
            const matchesSearch = service.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesCategory =
                categoryFilter === "All Categories" ||
                service.category === categoryFilter;
            const matchesStatus =
                statusFilter === "All Status" || service.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [searchTerm, categoryFilter, statusFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const currentServices = filteredServices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleExportCSV = () => {
        const headers = ["Title,Category,Status,Description"];
        const csvContent = filteredServices.map(
            (s) => `"${s.title}","${s.category}","${s.status}","${s.description}"`
        );
        const csv = [headers, ...csvContent].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "services.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Table Columns Configuration
    const columns = [
        {
            key: "image",
            label: "Image",
            render: (value, row) => (
                <img
                    src={value}
                    alt={row.title}
                    className="h-10 w-10 rounded object-cover"
                />
            ),
        },
        {
            key: "title",
            label: "Service Title",
            render: (value) => (
                <div className="text-sm font-medium text-gray-900">{value}</div>
            ),
        },
        {
            key: "category",
            label: "Category",
            render: (value) => (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {value}
                </span>
            ),
        },
        {
            key: "description",
            label: "Description",
            render: (value) => (
                <div className="text-sm text-gray-500 truncate max-w-xs">{value}</div>
            ),
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
                <div className="flex space-x-2">
                    <DynamicButton
                        icon={FiEye}
                        variant="outline"
                        className="p-1.5 border-gray-200 text-gray-400 hover:text-gray-600 !px-2"
                        onClick={() => console.log("View", row.id)}
                    />
                    <DynamicButton
                        icon={FiEdit2}
                        variant="outline"
                        className="p-1.5 border-gray-200 text-gray-400 hover:text-gray-600 !px-2"
                        onClick={() => console.log("Edit", row.id)}
                    />
                    <DynamicButton
                        icon={FiTrash2}
                        variant="outline"
                        className="p-1.5 border-red-100 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 !px-2"
                        onClick={() => console.log("Delete", row.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Service Management Center
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Manage engineering services, technical offerings, and project
                        capabilities
                    </p>
                </div>
                <DynamicButton icon={FiPlus} onClick={() => console.log("Add New Service")}>
                    Add New Service
                </DynamicButton>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-1 gap-4">
                    <DynamicSearch
                        value={searchTerm}
                        onChange={(val) => {
                            setSearchTerm(val);
                            setCurrentPage(1);
                        }}
                        placeholder="Search services..."
                    />
                    <DynamicDropdown
                        options={categories.filter(c => c !== "All Categories")}
                        value={categoryFilter}
                        onChange={(val) => {
                            setCategoryFilter(val);
                            setCurrentPage(1);
                        }}
                        defaultOption="All Categories"
                    />
                    <DynamicDropdown
                        options={statuses.filter(s => s !== "All Status")}
                        value={statusFilter}
                        onChange={(val) => {
                            setStatusFilter(val);
                            setCurrentPage(1);
                        }}
                        defaultOption="All Status"
                    />
                </div>
                <DynamicButton variant="secondary" onClick={handleExportCSV}>
                    Export CSV
                </DynamicButton>
            </div>

            <DynamicTable columns={columns} rows={currentServices} />

            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium">
                        {filteredServices.length > 0
                            ? (currentPage - 1) * itemsPerPage + 1
                            : 0}
                    </span>{" "}
                    -{" "}
                    <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredServices.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredServices.length}</span>{" "}
                    services
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}

export default Services;
