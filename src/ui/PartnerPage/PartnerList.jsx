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
import { PartnerForm } from "../forms/PartnerForm";
import { getAllPartners, createPartner, updatePartner, deletePartner, searchPartners, getStatuses, filterPartnersByStatus } from "../../api/partnerApi";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";
import { toast } from "sonner";

function PartnerList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [partners, setPartners] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statuses, setStatuses] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const statusParam = searchParams.get("status");

    const statusFilter = statusParam
        ? (statusParam.toLowerCase() === "active" ? "Active" : statusParam.toLowerCase() === "inactive" ? "Inactive" : statusParam)
        : "All Status";

    const itemsPerPage = 8;

    const setFiltersAndPage = ({ status, page }) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            
            const newPage = page !== undefined ? page : 1;
            if (newPage > 1) {
                next.set("page", String(newPage));
            } else {
                next.delete("page");
            }

            const newStatus = status !== undefined ? status : (searchParams.get("status") || "All Status");
            if (newStatus && newStatus !== "All Status") {
                next.set("status", newStatus.toLowerCase());
            } else {
                next.delete("status");
            }

            return next;
        }, { replace: true });
    };

    const setCurrentPage = (page) => {
        setFiltersAndPage({ page });
    };

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formType, setFormType] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({});
    const [selectedId, setSelectedId] = useState(null);
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

    const fetchPartners = async () => {
        const search = debouncedSearchTerm.trim();
        if (search.length > 0 && search.length < 3) {
            return;
        }

        setIsLoading(true);
        try {
            let data;
            const params = { page: currentPage, limit: itemsPerPage, sort: 'recent' };
            if (search.length >= 3) {
                data = await searchPartners(search, params);
            } else if (statusFilter !== "All Status") {
                data = await filterPartnersByStatus(statusFilter, params);
            } else {
                data = await getAllPartners(params);
            }
            if (data && data.status === "success") {
                const raw = data.data;
                const partnerItems = Array.isArray(raw) ? raw : (raw?.partners || raw?.data || []);
                const isClientSideSliced = partnerItems.length > itemsPerPage;
                const total = isClientSideSliced
                    ? partnerItems.length
                    : (data.totalPartners ?? data.total ?? partnerItems.length);

                setTotalItems(total);

                if (isClientSideSliced) {
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    setPartners(partnerItems.slice(startIndex, startIndex + itemsPerPage));
                } else {
                    setPartners(partnerItems);
                }

                setTotalPages(Math.ceil(total / itemsPerPage) || 1);
            }
        } catch (error) {
            console.error("Failed to fetch partners:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [currentPage, debouncedSearchTerm, statusFilter]);

    useEffect(() => {
        const fetchStatuses = async () => {
            const result = await getStatuses();
            if (result.status === "success") {
                setStatuses(result.data);
            }
        }; fetchStatuses();
    }, []);

    const currentData = partners;

    const handleExportCSV = () => {
        exportToCSV(partners, "Partners", {
            partnerName: "Partner Name",
            createdDate: "Upload Date",
            status: "Status"
        });
    };

    // Modal Handlers
    const handleAddNew = () => {
        setFormType('add');
        setSelectedId(null);
        setFormData({
            partnerName: '',
            status: 'Active',
            partnerImage: null
        });
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        setSelectedId(item._id || item.id);
        setErrors({});

        const editData = {
            ...item,
            partnerImage: item.partnerImage || item.image || item.partnerFile || '',
            partnerName: item.partnerName || item.company || item.name || '',
            status: item.status || 'Active'
        };
        setFormData(editData);
        initialFormDataRef.current = getComparableData(editData);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setSelectedId(item._id || item.id);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setErrors({});

        // Frontend validation removed; relying on backend.
        const partnerName = formData.partnerName || "";

        setIsSubmitting(true);

        const data = new FormData();

        // Match API requirement: partnerImage
        if (formData.partnerImage instanceof File) {
            data.append('partnerImage', formData.partnerImage);
        }

        // Match API requirement: partnerName
        data.append('partnerName', partnerName);
        data.append('status', formData.status || "Active");

        try {
            const payload = {};
            for (let [key, value] of data.entries()) {
                payload[key] = value instanceof File ? `File: ${value.name}` : value;
            }

            if (formType === 'add') {
                const res = await createPartner(data);
                if (res.status === "success") {
                    const msg = res?.message || res?.data?.message;
                    if (msg) toast.success(msg);
                    fetchPartners();
                    setIsFormModalOpen(false);
                } else {
                    if (res.message) toast.error(res.message);
                }
            } else {
                const res = await updatePartner(selectedId, data);
                if (res.status === "success") {
                    const msg = res?.message || res?.data?.message;
                    if (msg) toast.success(msg);
                    fetchPartners();
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
            const res = await deletePartner(selectedId);
            if (res.status === "success") {
                const msg = res?.message || res?.data?.message;
                if (msg) toast.success(msg);
                fetchPartners();
                setIsDeleteModalOpen(false);
            } else {
                if (res.message) toast.error(res.message);
            }
        } catch (error) {
            if (error.response?.data?.message) toast.error(error.response?.data?.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Columns: Image,  company,  upload date, status, action
    const columns = [
        {
            key: "partnerImage",
            label: "Image",
            render: (value, row) => (
                <div className="flex-shrink-0 h-14 w-14">
                    {value || row.partnerFile || row.image ? (
                        <img
                            src={value || row.partnerFile || row.image}
                            alt={row.partnerName || row.company}
                            className="h-full w-full rounded object-cover"
                        />
                    ) : (
                        <div className="h-full w-full rounded bg-gray-100 flex items-center justify-center text-gray-400">
                            N/A
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "partnerName",
            label: "Partner Name",
            className: "max-w-[200px] truncate whitespace-nowrap",
            render: (value, row) => <div className="font-medium text-gray-900 truncate" title={value || row.company || row.name}>{value || row.company || row.name}</div>,
        },
        {
            key: "createdDate",
            label: "Upload Date",
            render: (value, row) => {
                const displayDate = value || row.date;
                if (!displayDate) return <div className="text-sm text-gray-500">N/A</div>;
                try {
                    return <div className="text-sm text-gray-500">{new Date(displayDate).toLocaleDateString()}</div>;
                } catch (e) {
                    return <div className="text-sm text-gray-500">{displayDate}</div>;
                }
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
                        Partner Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-2">
                        Manage partners and affiliates
                    </p>
                </div>
                {/* Desktop Add Button */}
                <div className="hidden md:flex justify-end mt-2">
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-[#00A3E0] hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer"
                    >
                        <FiPlus size={18} />
                        Add Partner
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
                        placeholder="Search partners..."
                    />
                </div>
                <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-40">
                    <DynamicDropdown
                        options={statuses.filter((s) => s !== "All Status").length > 0 ? statuses.filter((s) => s !== "All Status") : ["Active", "Inactive"]}
                        value={statusFilter}
                        onChange={(val) => {
                            setFiltersAndPage({ status: val, page: 1 });
                        }}
                        defaultOption="All Status"
                    />
                </div>
                <div className="col-span-2 sm:col-span-1 sm:w-auto grid grid-cols-2 sm:flex gap-2 md:hidden">
                    <DynamicButton
                        icon={FiPlus}
                        onClick={handleAddNew}
                        className="w-full sm:w-auto justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                    >
                        <span className="hidden sm:inline">Add Partner</span>
                        <span className="sm:hidden">Add</span>
                    </DynamicButton>
                    <DynamicButton
                        variant="secondary"
                        onClick={handleExportCSV}
                        className="w-full sm:w-auto justify-center"
                    >
                        <span className="hidden sm:inline">Export CSV</span>
                        <span className="sm:hidden">Export</span>
                    </DynamicButton>
                </div>
                <div className="hidden md:flex md:ml-auto">
                    <button
                        onClick={handleExportCSV}
                        className="text-[#00A3E0] hover:underline text-sm font-medium bg-transparent border-none cursor-pointer px-2"
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
                    <DynamicTable columns={columns} rows={currentData} />
                )}
            </div>

            <div className="flex flex-col bg-white py-3 rounded-b-lg shadow   sm:flex-row justify-between items-center md:px-8 gap-4 pt-2">
                <div className="text-sm text-gray-500 order-2 sm:order-1">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                    </span>
                    -
                    <span className="font-medium text-gray-900">
                        {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span>{" "}
                    of <span className="font-medium text-gray-900">{totalItems}</span> partners
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
                title={formType === 'add' ? 'Add New Partner' : 'Edit Partner'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Add Partner' : 'Update Partner'}
                size="lg"
                errors={errors}
                formType={formType}
                isChanged={formType === 'add' || getComparableData(formData) !== initialFormDataRef.current}
            >
                <PartnerForm
                    formData={formData}
                    onChange={setFormData}
                    errors={errors}
                />
            </FormModal>

            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                entityName="Partner"
                itemName={selectedItem?.partnerName || selectedItem?.company || selectedItem?.name}
                isDeleting={isDeleting}
            />
        </div>

    );
}

export default PartnerList;
