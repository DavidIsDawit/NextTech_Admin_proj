import { useState, useMemo } from "react";
import { FiPlus, FiEye, FiTrash2, FiPlay } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import DynamicTable from "../DynamicTable";
import DynamicDropdown from "../DynamicDropdown";
import DynamicButton from "../DynamicButton";
import DynamicSearch from "../DynamicSearch";
import Pagination from "../Pagination";
import Badge from "../Badge";
import { mockGallery } from "../../data/mockGallery";
import { exportToCSV } from "../../utils/csvExport";

function GalleryList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const categories = useMemo(() => ["All Categories", ...new Set(mockGallery.map(s => s.category))], []);
    const statuses = useMemo(() => ["All Status", ...new Set(mockGallery.map(s => s.status))], []);

    const filteredData = useMemo(() => {
        return mockGallery.filter((item) => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "All Categories" || item.category === categoryFilter;
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [searchTerm, categoryFilter, statusFilter]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExportCSV = () => {
        exportToCSV(filteredData, "Gallery", {
            title: "Media Title",
            fileType: "File Type",
            uploadDate: "Upload Date",
            category: "Category",
            status: "Status"
        });
    };

    // Columns: Media, MEDIA TITLE, FILE TYPE, UPLOAD DATE, CATEGORY, Status, Actions
    const columns = [
        {
            key: "image",
            label: "Media",
            render: (value, row) => (
                <div className="relative flex-shrink-0 h-10 w-10">
                    <img src={value} alt={row.title} className="h-10 w-10 rounded object-cover" />
                    {row.fileType === "MP4" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/80 rounded-full p-1.5 shadow-sm border border-gray-100">
                                <FiPlay size={10} className="text-gray-900 fill-current" />
                            </div>
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "title",
            label: "Media Title",
            render: (value) => <div className="font-medium text-gray-900">{value}</div>,
        },
        {
            key: "fileType",
            label: "File Type",
            render: (value) => <span className="text-sm text-gray-500 uppercase">{value}</span>,
        },
        {
            key: "uploadDate",
            label: "Upload Date",
            render: (value) => <div className="text-sm text-gray-500">{value}</div>,
        },
        {
            key: "category",
            label: "Category",
            render: (value) => {
                let colorClass = "bg-gray-100 text-gray-800";
                if (value === "Site Photos") colorClass = "bg-blue-50 text-blue-600"; // Light blue for Site Photos
                if (value === "Process Videos") colorClass = "bg-sky-100 text-sky-600"; // Slightly different/lighter blue for videos

                return (
                    <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${colorClass}`}>
                        {value}
                    </span>
                );
            },
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
                        Gallery and Video Management Center
                    </h1>
                    <p className="text-base text-gray-500 mt-3">
                        Manage engineering services, technical offerings, and project capabilities
                    </p>
                </div>
                <DynamicButton
                    icon={FiPlus}
                    onClick={() => console.log("Add New")}
                    className="w-full sm:w-auto md:w-52 lg:w-44 xl:w-52 md:h-12 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                >
                    Add New Media
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
                            placeholder="Search Media..."
                        />
                    </div>
                    <div className="w-full sm:w-40">
                        <DynamicDropdown
                            options={categories.filter((s) => s !== "All Categories")}
                            value={categoryFilter}
                            onChange={(val) => {
                                setCategoryFilter(val);
                                setCurrentPage(1);
                            }}
                            defaultOption="All Categories"
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
                    Media
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

export default GalleryList;
