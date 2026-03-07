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
import { PortfolioForm } from "../forms/PortfolioForm";
import {
    getAllPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio
} from "../../api/portfolioApi";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";
import { toast } from "sonner";

function PortfolioList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sectorFilter, setSectorFilter] = useState("All Sectors");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Data State
    const [portfolios, setPortfolios] = useState([]);
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

    const fetchPortfolios = async () => {
        setIsLoading(true);
        try {
            const result = await getAllPortfolios({
                page: currentPage,
                limit: itemsPerPage,
                sort: "latest"
            });
            const portfolios = result.portfolios || result.data?.portfolios || (Array.isArray(result.data) ? result.data : []);

            // Backend in some cases might not return status: success for list
            if (result.status === "success" || portfolios.length >= 0) {
                const total = result.total || result.totalPortfolios || result.data?.total || portfolios.length;
                setPortfolios(portfolios);
                setTotalItems(total);
            }
        } catch (error) {
            console.error("Failed to fetch portfolios:", error);
            const status = error.response?.status;
            const msg = error.response?.data?.message || error.message;
            toast.error(`Failed to load portfolios (${status || 'Network Error'}): ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolios();
    }, [currentPage]);

    const sectors = useMemo(() => ["All Sectors", ...new Set(portfolios.map(s => s.sector).filter(Boolean))], [portfolios]);
    const statuses = useMemo(() => ["All Status", ...new Set(portfolios.map(s => s.status).filter(Boolean))], [portfolios]);

    const filteredData = useMemo(() => {
        return portfolios.filter((item) => {
            const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSector = sectorFilter === "All Sectors" || item.sector === sectorFilter;
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesSector && matchesStatus;
        });
    }, [searchTerm, sectorFilter, statusFilter, portfolios]);

    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    const handleExportCSV = () => {
        exportToCSV(filteredData, "Portfolios", {
            title: "Project Title",
            client: "Client",
            sector: "Sector",
            status: "Status",
            happingDate: "Date"
        });
    };

    // Modal Handlers
    const handleAddNew = () => {
        setFormType('add');
        setFormData({
            title: '',
            client: '',
            sector: '',
            catagory: '',
            subtitleOne: '',
            descriptionOne: '',
            subtitleTwo: '',
            subDescriptionTwo: '',
            subtitleThere: '',
            subDescriptionThere: '',
            resultOne: '',
            resultTwo: '',
            resultThere: '',
            requirement: '',
            status: 'active',
            happingDate: new Date().toISOString().split('T')[0],
            thumbinal: null,
            images: []
        });
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        // Normalize date for input[type="date"]
        const dateVal = item.happingDate ? new Date(item.happingDate).toISOString().split('T')[0] : '';

        setFormData({
            ...item,
            happingDate: dateVal,
            images: Array.isArray(item.images) ? item.images : []
        });
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
        if (formType === 'add' && !formData.thumbinal) newErrors.thumbinal = "Thumbnail image is required";
        if (!formData.title) newErrors.title = "Project name is required";
        if (!formData.client) newErrors.client = "Client name is required";
        if (!formData.sector) newErrors.sector = "Sector is required";
        if (!formData.catagory) newErrors.catagory = "Category is required";
        if (!formData.descriptionOne) newErrors.descriptionOne = "Project description is required";
        if (!formData.resultOne) newErrors.resultOne = "Result description is required";
        if (!formData.requirement) newErrors.requirement = "Project requirements are required";
        if (!formData.happingDate) newErrors.happingDate = "Project date is required";
        if (!formData.images || formData.images.length === 0) newErrors.images = "At least one gallery image is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();

            // All backend fields from the sample JSON
            const textFields = [
                'title', 'client', 'sector', 'catagory',
                'subtitleOne', 'descriptionOne',
                'subtitleTwo', 'subDescriptionTwo',
                'subtitleThere', 'subDescriptionThere',
                'resultOne', 'resultTwo', 'resultThere',
                'status', 'happingDate'
            ];

            textFields.forEach(field => {
                if (formData[field] !== undefined && formData[field] !== null) {
                    data.append(field, formData[field]);
                }
            });

            // Handle requirement (string or array)
            if (formData.requirement) {
                data.append('requirement', formData.requirement);
            }

            // Append thumbinal if it's a new file
            if (formData.thumbinal instanceof File) {
                data.append('thumbinal', formData.thumbinal);
            }

            // Append gallery images
            if (Array.isArray(formData.images)) {
                formData.images.forEach(file => {
                    if (file instanceof File) data.append('images', file);
                });
            }

            console.log('--- Portfolio FormData payload ---');
            const payload = {};
            for (const [key, value] of data.entries()) {
                payload[key] = value instanceof File ? `File(${value.name}, ${value.size}b)` : value;
            }
            console.log("Portfolio Payload:", payload);
            console.log('------------------------');

            let result;
            if (formType === 'add') {
                const res = await createPortfolio(data);
                if (res.status === "success") {
                    toast.success("Portfolio created successfully!");
                    await fetchPortfolios();
                    setIsFormModalOpen(false);
                } else {
                    toast.error(res.message || "Failed to create portfolio");
                }
            } else {
                const res = await updatePortfolio(selectedItem._id || selectedItem.id, data);
                if (res.status === "success") {
                    toast.success("Portfolio updated successfully!");
                    await fetchPortfolios();
                    setIsFormModalOpen(false);
                } else {
                    toast.error(res.message || "Failed to update portfolio");
                }
            }
        } catch (error) {
            console.error("Portfolio submission error:", error);
            const responseData = error?.response?.data;
            console.log("Raw backend error data:", responseData);
            console.group("Full Axios Error Details");
            console.log("Status:", error?.response?.status);
            console.log("Data:", responseData);
            console.log("Headers:", error?.response?.headers);
            console.groupEnd();

            const backendErrors = mapBackendErrors(error);
            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            }
            toast.error(extractErrorMessage(error, "Failed to save portfolio"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deletePortfolio(selectedItem._id || selectedItem.id);
            toast.success("Portfolio deleted successfully!");
            fetchPortfolios();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete portfolio:", error);
            toast.error(extractErrorMessage(error, "Failed to delete portfolio"));
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = [
        {
            key: "thumbinal",
            label: "Thumbnail",
            render: (value, row) => (
                <div className="flex-shrink-0 h-14 w-14">
                    <img
                        src={value || "/upload-placeholder.png"}
                        alt={row.title}
                        className="h-full w-full rounded object-cover border border-gray-100"
                        onError={(e) => { e.target.src = "/upload-placeholder.png"; }}
                    />
                </div>
            ),
        },
        {
            key: "title",
            label: "Project Title",
            className: "max-w-[200px] truncate whitespace-nowrap",
            render: (value) => <div className="font-medium text-gray-900 truncate" title={value}>{value}</div>,
        },
        {
            key: "client",
            label: "Client",
            render: (value) => <div className="text-sm text-gray-500">{value}</div>,
        },
        {
            key: "sector",
            label: "Sector",
            render: (value) => <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-blue-50 text-blue-700">{value}</span>,
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
                        onClick={() => console.log("View", row._id || row.id)}
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
        <div className="p-0 md:px-5 lg:px-2 2xl:px-5 space-y-1">
            <div className="mb-4 sm:mb-6 pt-2">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                    Portfolio Management
                </h1>
                <p className="text-sm sm:text-base text-gray-500 mt-2">
                    Manage your project portfolios and showcases
                </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-row flex-wrap items-center sm:justify-between gap-3 sm:gap-4 pb-6">
                <div className="col-span-2 sm:w-auto flex-1 md:max-w-md">
                    <DynamicSearch
                        value={searchTerm}
                        onChange={(val) => {
                            setSearchTerm(val);
                            setCurrentPage(1);
                        }}
                        placeholder="Search portfolios..."
                    />
                </div>
                <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-40">
                    <DynamicDropdown
                        options={sectors.filter((s) => s !== "All Sectors")}
                        value={sectorFilter}
                        onChange={(val) => {
                            setSectorFilter(val);
                            setCurrentPage(1);
                        }}
                        defaultOption="All Sectors"
                    />
                </div>
                <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-36">
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
                <div className="col-span-1 sm:w-auto flex justify-start">
                    <DynamicButton
                        icon={FiPlus}
                        onClick={handleAddNew}
                        className="w-auto md:w-52 md:h-11 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                    >
                        <span className="hidden sm:inline">Add Portfolio</span>
                        <span className="sm:hidden">Add</span>
                    </DynamicButton>
                </div>
                <div className="col-span-1 sm:w-auto flex justify-end">
                    <DynamicButton
                        variant="secondary"
                        onClick={handleExportCSV}
                        className="w-auto md:h-11 justify-center sm:justify-end text-sm font-medium"
                    >
                        <span className="hidden sm:inline">Export CSV</span>
                        <span className="sm:hidden">Export</span>
                    </DynamicButton>
                </div>
            </div>

            <div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A3E0]"></div>
                    </div>
                ) : (
                    <DynamicTable columns={columns} rows={filteredData} />
                )}
            </div>

            <div className="flex flex-col bg-white py-3 rounded-b-lg shadow sm:flex-row justify-between items-center md:px-8 gap-4 pt-2">
                <div className="text-sm text-gray-500 order-2 sm:order-1">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                    </span>
                    -
                    <span className="font-medium text-gray-900">
                        {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span>{" "}
                    of <span className="font-medium text-gray-900">{totalItems}</span> portfolios
                </div>
                <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => setCurrentPage(p)}
                    />
                </div>
            </div>

            {/* Modals */}
            <FormModal
                open={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                title={formType === 'add' ? 'Add New Project' : 'Edit Project'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Save Project' : 'Update Project'}
                size="lg"
                errors={errors}
            >
                <PortfolioForm
                    formData={formData}
                    onChange={setFormData}
                    errors={errors}
                />
            </FormModal>

            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                entityName="Portfolio"
                itemName={selectedItem?.title}
                image={selectedItem?.thumbinal}
                isDeleting={isDeleting}
            />
        </div>
    );
}

export default PortfolioList;
