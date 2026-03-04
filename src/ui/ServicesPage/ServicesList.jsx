import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiEye, FiTrash2 } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import DynamicTable from "../DynamicTable";
import DynamicDropdown from "../DynamicDropdown";
import DynamicButton from "../DynamicButton";
import DynamicSearch from "../DynamicSearch";
import Pagination from "../Pagination";
import Badge from "../Badge";
import { exportToCSV } from "../../utils/csvExport";
import { FormModal } from "../modals/FormModal";
import { DeleteModal } from "../modals/DeleteModal";
import { ServiceForm } from "../forms/ServiceForm";
import { getAllServices, createService, updateService, deleteService } from "../../api/serviceApi";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";
import { toast } from "sonner";

function Services() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Data State
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formType, setFormType] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [errors, setErrors] = useState({});

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const result = await getAllServices({ page: currentPage, limit: 100 }); // Fetch more for local filtering or adjust pagination
            if (result.status === "success") {
                setServices(result.data.services || []);
                setTotalItems(result.total || result.data.services?.length || 0);
            }
        } catch (error) {
            console.error("Failed to fetch services:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const categories = useMemo(() => ["All Categories", ...new Set(services.map(s => s.catagory || s.category))], [services]);
    const statuses = useMemo(() => ["All Status", ...new Set(services.map(s => s.status))], [services]);

    // Filter Logic
    const filteredServices = useMemo(() => {
        return services.filter((service) => {
            const matchesSearch = service.title
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesCategory =
                categoryFilter === "All Categories" ||
                (service.catagory || service.category) === categoryFilter;
            const matchesStatus =
                statusFilter === "All Status" || service.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [searchTerm, categoryFilter, statusFilter, services]);

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
        setFormData({
            title: '',
            catagory: '',
            description: '',
            headLine: '',
            status: 'published',
            imageCover: null,
            images: [],
            subTitleOne: '',
            subdescriptionOne: '',
            subTitleTwo: '',
            subdescriptionTwo: ''
        });
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        setFormData({ ...item });
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setErrors({});

        // Frontend Validation
        const newErrors = {};
        if (formType === 'add' && !formData.imageCover) newErrors.imageCover = "Cover image is required";
        if (!formData.title) newErrors.title = "Service title is required";
        if (!formData.catagory) newErrors.catagory = "Category is required";
        if (!formData.description) newErrors.description = "Service description is required";
        if (!formData.headLine) newErrors.headLine = "Headline is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'images' && Array.isArray(formData[key])) {
                    formData[key].forEach(file => {
                        if (file instanceof File) data.append('images', file);
                    });
                } else if (key === 'imageCover' && formData[key] instanceof File) {
                    data.append('imageCover', formData[key]);
                } else if (key !== 'images' && key !== 'imageCover' && formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });

            console.log('--- Service FormData payload ---');
            for (const [key, value] of data.entries()) {
                console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size}b)` : value);
            }
            console.log('------------------------');


            if (formType === 'add') {
                const res = await createService(data);
                if (res.status === "success") {
                    toast.success("Service created successfully!");
                    await fetchServices();
                    setIsFormModalOpen(false);
                } else {
                    toast.error(res.message || "Failed to create service");
                }
            } else {
                const res = await updateService(selectedItem._id || selectedItem.id, data);
                if (res.status === "success") {
                    toast.success("Service updated successfully!");
                    await fetchServices();
                    setIsFormModalOpen(false);
                } else {
                    toast.error(res.message || "Failed to update service");
                }
            }
        } catch (error) {
            console.error("Service submission error:", error);
            const backendErrors = mapBackendErrors(error);
            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            }
            toast.error(extractErrorMessage(error, "Failed to save service"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deleteService(selectedItem._id || selectedItem.id);
            await fetchServices();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete service:", error);
        } finally {
            setIsDeleting(false);
        }
    };


    // Table Columns Configuration
    const columns = [
        {
            key: "imageCover",
            label: "Image",
            render: (value, row) => (
                <div className="flex-shrink-0 h-14 w-14">
                    <img
                        src={value || row.thumbnail}
                        alt={row.title}
                        className="h-full w-full rounded object-cover"
                    />
                </div>
            ),
        },
        {
            key: "title",
            label: "Service Title",
            className: "max-w-[200px] truncate whitespace-nowrap",
            render: (value) => (
                <div className="font-medium text-gray-900 truncate" title={value}>{value}</div>
            ),
        },
        {
            key: "catagory",
            label: "Category",
            render: (value, row) => {
                const displayValue = value || row.category;
                let colorClass = "bg-gray-100 text-gray-800";
                if (displayValue === "Construction") colorClass = "bg-blue-50 text-blue-600";
                if (displayValue === "Consulting") colorClass = "bg-green-50 text-green-600";
                if (displayValue === "Infrastructure") colorClass = "bg-gray-50 text-gray-600";
                if (displayValue === "Design") colorClass = "bg-purple-50 text-purple-600";

                return (
                    <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${colorClass}`}>
                        {displayValue}
                    </span>
                );
            },
        },
        {
            key: "shortDescription",
            label: "Description",
            className: "max-w-[250px] truncate whitespace-nowrap",
            render: (value) => (
                <div className="text-gray-500 truncate" title={value}>{value}</div>
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
        <div className="p-0 md:px-5  lg:px-2 2xl:px-5 space-y-1">
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
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-16 pb-8">
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
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A3E0]"></div>
                    </div>
                ) : (
                    <DynamicTable columns={columns} rows={currentServices} />
                )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col bg-white py-3 rounded-b-lg shadow   sm:flex-row justify-between items-center md:px-8 gap-4 pt-2">
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
                    errors={errors}
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
