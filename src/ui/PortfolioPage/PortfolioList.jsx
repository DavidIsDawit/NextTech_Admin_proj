import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";
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
    deletePortfolio,
    searchPortfolios,
    getSectors,
    getStatuses,
    filterPortfoliosByStatus,
    filterPortfoliosBySectors
} from "../../api/portfolioApi";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";
import { toast } from "sonner";

function PortfolioList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sectors, setSectors] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [sectorFilter, setSectorFilter] = useState("All Sectors");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const setCurrentPage = (page) => {
        setSearchParams((prev) => {
            prev.set("page", page);
            return prev;
        });
    };
    const itemsPerPage = 8;

    // Data State
    const [portfolios, setPortfolios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formType, setFormType] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [errors, setErrors] = useState({});
    const initialFormDataRef = useRef(null);

    // Compare form data for isChanged (handles File objects)
    const getComparableData = (data) => {
        const clone = { ...data };
        Object.keys(clone).forEach(key => {
            if (clone[key] instanceof File) clone[key] = '__file__';
        });
        return JSON.stringify(clone);
    };

    // Debounced search
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchPortfolios = async () => {
        const search = debouncedSearchTerm.trim();
        if (search.length > 0 && search.length < 3) {
            return;
        }

        setIsLoading(true);
        try {
            let result;
            const params = { page: currentPage, limit: itemsPerPage, sort: "latest" };

            if (search.length >= 3) {
                result = await searchPortfolios(search, params);
            } else if (sectorFilter !== "All Sectors") {
                result = await filterPortfoliosBySectors(sectorFilter, params);
            } else if (statusFilter !== "All Status") {
                result = await filterPortfoliosByStatus(statusFilter, params);
            } else {
                result = await getAllPortfolios(params);
            }

            let portfolioItems = [];
            if (Array.isArray(result)) {
                portfolioItems = result;
            } else if (result && typeof result === "object") {
                portfolioItems = result.portfolios || result.data?.portfolios || (Array.isArray(result.data) ? result.data : []);
            }

            const isClientSideSliced = portfolioItems.length > itemsPerPage;
            const total = isClientSideSliced
                ? portfolioItems.length
                : (result?.totalPortfolios || result?.total || portfolioItems.length);

            setTotalItems(total);

            if (isClientSideSliced) {
                const startIndex = (currentPage - 1) * itemsPerPage;
                setPortfolios(portfolioItems.slice(startIndex, startIndex + itemsPerPage));
            } else {
                setPortfolios(portfolioItems);
            }

            setTotalPages(Math.ceil(total / itemsPerPage) || 1);
        } catch (error) {
            console.error("Failed to fetch portfolios:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolios();
    }, [currentPage, debouncedSearchTerm, sectorFilter, statusFilter]);

    useEffect(() => {
        const fetchSectors = async () => {
            const result = await getSectors();
            if (result.status === "success") {
                setSectors(result.data);
            }
        }; fetchSectors();
    }, []);

    useEffect(() => {
        const fetchStatuses = async () => {
            const result = await getStatuses();
            if (result.status === "success") {
                setStatuses(result.data);
            }
        }; fetchStatuses();
    }, []);

    // const sectors = useMemo(() => ["All Sectors", ...new Set(portfolios.map(s => s.sector).filter(Boolean))], [portfolios]);
    // const statuses = useMemo(() => ["All Status", ...new Set(portfolios.map(s => s.status).filter(Boolean))], [portfolios]);

    // Server-side pagination: portfolios already contains only the current page items
    // const filteredPortfolios = portfolios.filter(item => {
    //     const sectorMatch = sectorFilter === "All Sectors" || item.sector === sectorFilter;
    //     const statusMatch = statusFilter === "All Status" || item.status === statusFilter;
    //     return sectorMatch && statusMatch;
    // });
    // const currentData = filteredPortfolios;
    const currentPortfolios = portfolios.filter(item =>
        (statusFilter === "All Status" || item.status === statusFilter) &&
        (sectorFilter === "All Sectors" || item.sector === sectorFilter)
    );

    const handleExportCSV = () => {
        exportToCSV(portfolios, "Portfolios", {
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
            requirements: [],
            status: 'Active',
            happingDate: '',
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

        const editData = {
            ...item,
            happingDate: dateVal,
            images: Array.isArray(item.images) ? item.images : []
        };
        setFormData(editData);
        initialFormDataRef.current = getComparableData(editData);
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        const validationErrors = {};
        if (!formData.thumbinal) validationErrors.thumbinal = 'Thumbnail is required.';
        if (!formData.title?.trim()) validationErrors.title = 'Project name is required.';

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});

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

            // Handle requirements (array joined as comma-separated string)
            if (formData.requirements && Array.isArray(formData.requirements)) {
                const reqString = formData.requirements.filter(r => r.trim()).join(', ');
                if (reqString) {
                    data.append('requirement', reqString);
                }
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

            let result;
            if (formType === 'add') {
                const res = await createPortfolio(data);
                if (res.status === "success") {
                    const msg = res?.message || res?.data?.message;
                    if (msg) toast.success(msg);
                    await fetchPortfolios();
                    setIsFormModalOpen(false);
                } else {
                    if (res.message) toast.error(res.message);
                }
            } else {
                const res = await updatePortfolio(selectedItem._id || selectedItem.id, data);
                if (res.status === "success") {
                    const msg = res?.message || res?.data?.message;
                    if (msg) toast.success(msg);
                    await fetchPortfolios();
                    setIsFormModalOpen(false);
                } else {
                    if (res.message) toast.error(res.message);
                }
            }
        } catch (error) {
            const backendErrors = mapBackendErrors(error);
            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            } else {
                if (error?.response?.data?.message) toast.error(error.response.data.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            const res = await deletePortfolio(selectedItem._id || selectedItem.id);
            const msg = res?.message || res?.data?.message;
            if (msg) toast.success(msg);
            fetchPortfolios();
            setIsDeleteModalOpen(false);
        } catch (error) {
            if (error?.response?.data?.message) toast.error(error.response.data.message);
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
                        alt=""
                        className="h-full w-full rounded object-cover border border-gray-100"
                        onError={(e) => { e.target.src = "/upload-placeholder.png"; }}
                    />
                </div>
            ),
        },
        {
            key: "title",
            label: "Portfolio Title",
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
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 sm:mb-6 pt-2 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        Portfolio Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-2">
                        Manage your project portfolios and showcases
                    </p>
                </div>
                {/* Desktop Add Button */}
                <div className="hidden md:flex justify-end mt-2">
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-[#00A3E0] hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer"
                    >
                        <FiPlus size={18} />
                        Add Portfolio
                    </button>
                </div>
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
                {sectors.length > 1 && (
                    <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-40">
                        {/* <DynamicDropdown
                            options={sectors.filter((s) => s !== "All Sectors")}
                            value={sectorFilter}
                            onChange={(val) => {
                                setSectorFilter(val);
                                setCurrentPage(1);
                            }}
                            defaultOption="All Sectors"
                        /> */}
                        <DynamicDropdown
                            options={sectors}
                            value={sectorFilter}
                            defaultOption="All Sectors"
                            onChange={(val) => {
                                setSectorFilter(val);
                                setCurrentPage(1);
                            }} />
                    </div>
                )}
                {statuses.length > 1 && (
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
                )}
                <div className="col-span-1 sm:w-auto flex justify-start md:hidden">
                    <DynamicButton
                        icon={FiPlus}
                        onClick={handleAddNew}
                        className="w-auto md:w-52 md:h-11 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                    >
                        <span className="hidden sm:inline">Add Portfolio</span>
                        <span className="sm:hidden">Add</span>
                    </DynamicButton>
                </div>
                <div className="col-span-1 sm:w-auto flex justify-end md:ml-auto flex-col sm:flex-row items-end sm:items-center">
                    {/* Mobile Export Button */}
                    <div className="md:hidden">
                        <DynamicButton
                            variant="secondary"
                            onClick={handleExportCSV}
                            className="w-auto md:h-11 justify-center sm:justify-end text-sm font-medium"
                        >
                            <span className="hidden sm:inline">Export CSV</span>
                            <span className="sm:hidden">Export</span>
                        </DynamicButton>
                    </div>
                    {/* Desktop Export Link */}
                    <button
                        onClick={handleExportCSV}
                        className="hidden md:block text-[#00A3E0] hover:underline text-sm font-medium bg-transparent border-none cursor-pointer px-2"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            <div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A3E0]"></div>
                    </div>
                ) : (
                    <DynamicTable columns={columns} rows={currentPortfolios} />
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
                title={formType === 'add' ? 'Add New Portfolio' : 'Edit Portfolio'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Save Portfolio' : 'Update Portfolio'}
                size="lg"
                errors={errors}
                formType={formType}
                isChanged={formType === 'add' || getComparableData(formData) !== initialFormDataRef.current}
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
