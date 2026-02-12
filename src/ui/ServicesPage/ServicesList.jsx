import { useState, useMemo } from "react";
import { FiPlus, FiEye, FiTrash2 } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import DynamicTable from "../DynamicTable";
import DynamicDropdown from "../DynamicDropdown";
import DynamicButton from "../DynamicButton";
import DynamicSearch from "../DynamicSearch";
import Pagination from "../Pagination";
import Badge from "../Badge";
import { ServicesData } from "../../data/ServicesData";
import { exportToCSV } from "../../utils/csvExport";
import { FormModal } from "../modals/FormModal";
import { DeleteModal } from "../modals/DeleteModal";
import { ServiceForm } from "../forms/ServiceForm";

function Services() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formType, setFormType] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const categories = useMemo(() => ["All Categories", ...new Set(ServicesData.map(s => s.category))], []);
    const statuses = useMemo(() => ["All Status", ...new Set(ServicesData.map(s => s.status))], []);

    // Filter Logic
    const filteredServices = useMemo(() => {
        return ServicesData.filter((service) => {
            const matchesSearch = service.title
                ?.toLowerCase()
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
        exportToCSV(filteredServices, "Services", {
            title: "Service Title",
            category: "Category",
            status: "Status",
            shortDescription: "Description"
        });
    };

    // Modal Handlers
    const handleAddNew = () => {
        setFormType('add');
        setFormData({ status: 'active' });
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        setFormData({ ...item });
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            console.log(`Service ${formType === 'add' ? 'added' : 'updated'}:`, formData);
            setIsSubmitting(false);
            setIsFormModalOpen(false);
        }, 1000);
    };

    const handleDeleteConfirm = () => {
        setIsDeleting(true);
        // Simulate API call
        setTimeout(() => {
            console.log("Service deleted:", selectedItem.id);
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }, 1000);
    };


    // Table Columns Configuration
    const columns = [
        {
            key: "thumbnail",
            label: "Image",
            render: (value, row) => (
                <div className="flex-shrink-0 h-14 w-14">
                    <img
                        src={value}
                        alt={row.title}
                        className="h-full w-full rounded object-cover"
                    />
                </div>
            ),
        },
        {
            key: "title",
            label: "Service Title",
            render: (value) => (
                <div className="font-medium text-gray-900">{value}</div>
            ),
        },
        {
            key: "category",
            label: "Category",
            render: (value) => {
                let colorClass = "bg-gray-100 text-gray-800";
                if (value === "Construction") colorClass = "bg-blue-50 text-blue-600";
                if (value === "Consulting") colorClass = "bg-green-50 text-green-600";
                if (value === "Infrastructure") colorClass = "bg-gray-50 text-gray-600";
                if (value === "Design") colorClass = "bg-purple-50 text-purple-600";

                return (
                    <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${colorClass}`}>
                        {value}
                    </span>
                );
            },
        },
        {
            key: "shortDescription",
            label: "Description",
            render: (value) => (
                <div className="text-gray-500 truncate max-w-xs" title={value}>{value}</div>
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
                        onClick={() => handleEdit(row)}
                        title="Edit"
                    >
                        <BiEdit size={21} />
                    </button>
                    <button
                        className="p-1 text-red-300 hover:text-red-500 rounded border border-red-100 hover:bg-red-50 transition-colors"
                        onClick={() => handleDeleteClick(row)}
                        title="Delete"
                    >
                        <FiTrash2 size={21} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-0 md:px-5  lg:px-2 2xl:px-5 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl lg:text-3xl 2xl:text-4xl font-bold text-gray-900">
                        Service Management Center
                    </h1>
                    <p className="text-base text-gray-500 mt-3">
                        Manage engineering services, technical offerings, and project capabilities
                    </p>
                </div>
                <DynamicButton

                    icon={FiPlus}

                    onClick={handleAddNew}
                    className="w-full sm:w-auto md:w-52 lg:w-44 xl:w-52 md:h-12 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                >
                    Add New Service
                </DynamicButton>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-12">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
                    <div className="w-full sm:w-96 lg:w-80 2xl:w-96  ">
                        <DynamicSearch
                            value={searchTerm}
                            onChange={(val) => {
                                setSearchTerm(val);
                                setCurrentPage(1);
                            }}
                            placeholder="Search services..."
                        />
                    </div>
                    <div className="w-full sm:w-40">
                        <DynamicDropdown
                            options={categories.filter(c => c !== "All Categories")}
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
                            options={statuses.filter(s => s !== "All Status")}
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

            {/* Table */}
            <div>
                <DynamicTable columns={columns} rows={currentServices} />
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center md:px-8 gap-4 pt-2">
                <div className="text-sm text-gray-500 order-2 sm:order-1">
                    Showing <span className="font-medium text-gray-900">{filteredServices.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span>-
                    <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredServices.length)}</span> of <span className="font-medium text-gray-900">{filteredServices.length}</span> services
                </div>
                <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            {/* Modals */}
            <FormModal
                open={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                title={formType === 'add' ? 'Add New Service' : 'Edit Service'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Add Service' : 'Save Changes'}
                size="lg"
            >
                <ServiceForm
                    formData={formData}
                    onChange={setFormData}
                />
            </FormModal>

            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                entityName="Service"
                itemName={selectedItem?.title}
                image={selectedItem?.image}
                isDeleting={isDeleting}
            />
        </div>
    );
}

export default Services;
