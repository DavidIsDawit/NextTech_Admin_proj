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
import { CertificateForm } from "../forms/CertificateForm";
import { getAllCertificates, createCertificate, updateCertificate, deleteCertificate, searchCertificates, getStatuses, filterCertificatesByStatus } from "../../api/certificateApi";
import api, { buildImageUrl } from "../../api/api";
import { toast } from "sonner";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";

function CertificateList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [certificates, setCertificates] = useState([]);
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

    const fetchCertificates = async () => {
        const search = debouncedSearchTerm.trim();
        if (search.length > 0 && search.length < 3) {
            return;
        }

        setIsLoading(true);
        try {
            let data;
            const params = { page: currentPage, limit: itemsPerPage, sort: 'recent' };
            if (statusFilter !== "All Status") {
                params.status = statusFilter;
            }

            if (search.length >= 3) {
                data = await searchCertificates(search, params);
            } else if (statusFilter !== "All Status") {
                data = await filterCertificatesByStatus(statusFilter, params);
            } else {
                data = await getAllCertificates(params);
            }
            if (data && data.status === "success") {
                let certificateItems = data.certificates || data.data || [];

                if (statusFilter !== "All Status") {
                    const statusMatch = statusFilter.toLowerCase();
                    certificateItems = certificateItems.filter(item => (item.status || "").toLowerCase() === statusMatch);
                }

                const isClientSideSliced = certificateItems.length > itemsPerPage;
                const total = isClientSideSliced
                    ? certificateItems.length
                    : (data.totalCertificates ?? data.total ?? certificateItems.length);

                setTotalItems(total);

                if (isClientSideSliced) {
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    setCertificates(certificateItems.slice(startIndex, startIndex + itemsPerPage));
                } else {
                    setCertificates(certificateItems);
                }

                setTotalPages(Math.ceil(total / itemsPerPage) || 1);
            }
        } catch (error) {
            console.error("Failed to fetch certificates:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, [currentPage, debouncedSearchTerm, statusFilter]);

    useEffect(() => {
        const fetchStatuses = async () => {
            const result = await getStatuses();
            if (result.status === "success") {
                setStatuses(result.data);
            }
        }; fetchStatuses();
    }, []);

    const currentData = useMemo(() => {
        return certificates.filter((item) => {
            const itemStatus = item.status || "";
            return statusFilter === "All Status" || itemStatus.toLowerCase() === statusFilter.toLowerCase();
        });
    }, [certificates, statusFilter]);

    // const statuses = useMemo(() => ["All Status", ...new Set(certificates.map(s => s.status).filter(Boolean))], [certificates]);

    // Server-side pagination: certificates already contains only the current page
    // const filteredCertificates = certificates.filter(item => {
    //     return statusFilter === "All Status" || item.status === statusFilter;
    // });
    // const currentData = filteredCertificates;

    // const handleExportCSV = () => {
    //     exportToCSV(certificates, "Certificates", {
    //         title: "Certificate Title",
    //         issueDate: "Issue Date",
    //         status: "Status"
    //     });
    // };
    const handleExportCSV = () => {
        const exportData = certificates.map((cert) => ({
            title: cert.title || cert.certificateName,
            issueDate: cert.issueDate || cert.IssueDate,
            status: cert.status,
        }));

        exportToCSV(exportData, "Certificates", {
            title: "Certificate Title",
            issueDate: "Issue Date",
            status: "Status",
        });
    };

    // Modal Handlers
    const handleAddNew = () => {
        setFormType('add');
        setFormData({
            title: '',   // → certificateName
            certificateType: '',   // → certificateType  (e.g. "Technical", "Safety")
            issuedBy: '',   // → certificateFrom
            description: '',   // → certificateDescription
            issueDate: '',   // → IssueDate
            status: 'Active',
            project: '',
            catagory: '',
            certificate: null, // new File upload
            certificateImage: '',
        });
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        setSelectedId(item._id ?? item.id);
        setErrors({});

        // Normalise the issue date to YYYY-MM-DD for the date input
        let formattedDate = '';
        const rawDate = item.IssueDate || item.issueDate;
        if (rawDate) {
            try {
                formattedDate = new Date(rawDate).toISOString().split('T')[0];
            } catch (e) {
                formattedDate = '';
            }
        }

        // Map backend fields to form fields.
        // certificateType  and certificateDescription are TWO separate backend fields.
        const editData = {
            ...item,
            certificate: null,   // clear stale File object; keep certificateImage for preview
            certificateImage: item.certificateImage || item.image || '',
            title: item.certificateName || item.title || '',
            certificateType: item.certificateType || '',
            issuedBy: item.certificateFrom || item.issuedBy || '',
            description: item.certificateDescription || item.description || '',
            issueDate: formattedDate,
            status: item.status || 'Active',
            project: item.project || '',
            catagory: item.catagory || '',
        };
        setFormData(editData);
        initialFormDataRef.current = getComparableData(editData);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setErrors({});

        setIsSubmitting(true);
        const data = new FormData();

        // Append image only if user has chosen a new file.
        if (formData.certificate instanceof File) {
            data.append('certificateImage', formData.certificate);
        }

        // Build payload including both standard field names (title, issuedBy, issueDate, description)
        // and legacy backend aliases (certificateName, certificateFrom, IssueDate, certificateDescription)
        const payload = {
            title: formData.title || '',
            certificateName: formData.title || '',
            issuedBy: formData.issuedBy || '',
            certificateFrom: formData.issuedBy || '',
            issueDate: formData.issueDate || '',
            IssueDate: formData.issueDate || '',
            description: formData.description || '',
            certificateDescription: formData.description || '',
            certificateType: formData.certificateType || '',
            status: formData.status || 'Active',
            project: formData.project || '',
            catagory: formData.catagory || '',
            category: formData.catagory || '',
        };

        // Append fields from payload
        Object.entries(payload).forEach(([key, value]) => {
            data.append(key, value);
        });

        try {
            if (formType === 'add') {
                const res = await createCertificate(data);
                const msg = res?.message || res?.data?.message || 'Certificate created successfully!';
                toast.success(msg);
            } else {
                const res = await updateCertificate(selectedId, data);
                const msg = res?.message || res?.data?.message || 'Certificate updated successfully!';
                toast.success(msg);
            }
            setIsFormModalOpen(false);
            fetchCertificates();
        } catch (error) {
            const backendErrors = mapBackendErrors(error);

            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            } else {
                const msg = extractErrorMessage(error, 'Failed to save certificate');
                if (msg) setErrors({ general: msg });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteCertificate(selectedItem._id || selectedItem.id);
            const msg = res?.message || res?.data?.message;
            if (msg) toast.success(msg);
            setIsDeleteModalOpen(false);
            fetchCertificates();
        } catch (error) {
            // Error handled globally in api.js
        } finally {
            setIsDeleting(false);
        }
    };

    // Columns: Preview, title, issue date, status, action
    // we now post‑process responses in the API layer, so most items
    // already contain a full, usable URL.  buildImageUrl can still handle
    // relative paths or fallback to placeholder when needed.
    const getImageUrl = (value) => {
        if (!value) return "/upload-placeholder.png";
        return buildImageUrl(value) || "/upload-placeholder.png";
    };

    const columns = [
        {
            key: "certificateImage",
            label: "Image",
            render: (value, row) => {
                const imageUrl = getImageUrl(value);

                return (
                    <div className="flex-shrink-0 h-14 w-14">
                        <img
                            src={imageUrl}
                            alt=""
                            crossOrigin="anonymous"
                            className="h-full w-full rounded object-cover"

                        />
                    </div>
                );
            },
        },
        {
            key: "certificateName",
            label: "Certificate Title",
            className: "max-w-[220px] truncate",
            render: (value, row) => {
                const title = value || row.title || "—";
                return (
                    <div className="font-medium text-gray-900 truncate" title={title}>
                        {title}
                    </div>
                );
            },
        },
        {
            key: "certificateType",
            label: "Type",
            render: (value) => (
                <div className="text-sm text-gray-600">{value || '—'}</div>
            ),
        },
        {
            key: "certificateFrom",
            label: "Issued By",
            render: (value, row) => (
                <div className="text-sm text-gray-600">{value || row.issuedBy || '—'}</div>
            ),
        },
        {
            key: "IssueDate",
            label: "Issue Date",
            render: (value, row) => {
                const date = value || row.issueDate;
                return (
                    <div className="text-sm text-gray-500">
                        {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </div>
                );
            },
        },
        {
            key: "status",
            label: "Status",
            render: (value) => <Badge type={value || 'Active'}>{value || 'Active'}</Badge>,
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => {
                return (
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
                );
            },
        },
    ];


    return (
        <div className="p-0 md:px-5 lg:px-2 2xl:px-5 space-y-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 sm:mb-6 pt-2 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        Certificate Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-2">
                        Manage certifications and awards
                    </p>
                </div>
                {/* Desktop Add Button */}
                <div className="hidden md:flex justify-end mt-2">
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-[#00A3E0] hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer"
                    >
                        <FiPlus size={18} />
                        Add Certificate
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
                        placeholder="Search certificates..."
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
                        <span className="hidden sm:inline">Add Certificate</span>
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
                    of <span className="font-medium text-gray-900">{totalItems}</span> certificates
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
                title={formType === 'add' ? 'Add New Certificate' : 'Edit Certificate'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Add Certificate' : 'Update Certificate'}
                size="lg"
                errors={errors}
                formType={formType}
                isChanged={formType === 'add' || getComparableData(formData) !== initialFormDataRef.current}
            >
                <CertificateForm
                    formData={formData}
                    onChange={setFormData}
                    errors={errors}
                />
            </FormModal>

            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                entityName="Certificate"
                itemName={selectedItem?.title || selectedItem?.certificateName}
                isDeleting={isDeleting}
            />
        </div>

    );
}

export default CertificateList;
