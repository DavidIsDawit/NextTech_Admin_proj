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
import { CertificateForm } from "../forms/CertificateForm";
import { getAllCertificates, createCertificate, updateCertificate, deleteCertificate } from "../../api/certificateApi";
import api, { buildImageUrl } from "../../api/api";
import { toast } from "sonner";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";

function CertificateList() {
    const [certificates, setCertificates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    // (role gating removed - edit/delete visible to everyone)
    const userRole = null; // unused
    // Backend pagination is fixed at 10 items per page
    const itemsPerPage = 10;

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

    const [totalCertificates, setTotalCertificates] = useState(0);

    const fetchCertificates = async () => {
        setIsLoading(true);
        try {
            // Backend handles pagination
            const params = {
                page: currentPage,
                sort: 'recent' // Default according to Postman docs
            };

            const data = await getAllCertificates(params);
            if (data.status === "success") {
                setCertificates(data.certificates || []);
                setTotalCertificates(data.totalCertificates || 0);
            }
        } catch (error) {
            // Error handled globally in api.js
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, [currentPage]);

    const statuses = useMemo(() => ["All Status", ...new Set(certificates.map(s => s.status).filter(Boolean))], [certificates]);

    // Apply frontend search and filter only to currently fetched page,
    // or if the backend supports filter, it should be passed in params.
    // For now, based on Postman docs, backend only supports page and sort.
    const filteredData = useMemo(() => {
        return certificates.filter((item) => {
            const name = item.title || item.certificateName || "";
            const matchesSearch = searchTerm.length < 3 || name.toLowerCase().includes(searchTerm.toLowerCase());
            const status = item.status || "Active";
            const matchesStatus = statusFilter === "All Status" || status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, certificates]);

    const totalPages = Math.ceil(totalCertificates / itemsPerPage);
    const currentData = filteredData;


    const handleExportCSV = () => {
        exportToCSV(filteredData, "Certificates", {
            title: "Certificate Title",
            issueDate: "Issue Date",
            status: "Status"
        });
    };

    // Modal Handlers
    const handleAddNew = () => {
        // both admin and normal users can add
        setFormType('add');
        setFormData({
            title: '',
            issuedBy: '',
            description: '',
            issueDate: '',
            status: 'Active',
            certificate: null,
            certificateImage: ''
        });
        setErrors({});

        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        setSelectedId(item._id ?? item.id);
        setErrors({});

        let formattedDate = '';
        if (item.issueDate || item.IssueDate) {
            try {
                formattedDate = new Date(item.issueDate || item.IssueDate).toISOString().split('T')[0];
            } catch (e) {
                formattedDate = '';
            }
        }

        // Map backend fields to form fields, clear any stale File object
        setFormData({
            ...item,
            certificate: null,
            // if API returned a relative path we can still store it; buildImageUrl
            // will convert when the form component shows the preview
            certificateImage: item.certificateImage || item.image || '',
            title: item.title || item.certificateName || '',
            issuedBy: item.issuedBy || item.certificateFrom || '',
            description: item.description || item.certificateType || '',
            issueDate: formattedDate,
            status: item.status || 'Active'
        });
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
        if (formType === 'add' && !formData.certificate) newErrors.certificate = "Certificate image is required";
        if (!formData.title) newErrors.title = "Certificate title is required";
        if (!formData.issuedBy) newErrors.issuedBy = "Issuer name is required";
        if (!formData.issueDate) newErrors.issueDate = "Issue date is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        const data = new FormData();

        // Append image only if user has chosen a new file.
        if (formData.certificate instanceof File) {
            data.append('certificateImage', formData.certificate);
        }

        // Map frontend fields to backend expected fields
        const payload = {
            certificateName: formData.title || "",
            title: formData.title || "",
            certificateType: formData.description || "",
            description: formData.description || "",
            certificateFrom: formData.issuedBy || "",
            issuedBy: formData.issuedBy || "",
            IssueDate: formData.issueDate || "",
            issueDate: formData.issueDate || "",
            status: formData.status || "Active"
        };

        Object.keys(payload).forEach(key => {
            if (payload[key]) {
                data.append(key, payload[key]);
            }
        });

        try {
            console.log('Submitting certificate form...', { formType, id: selectedItem?._id || selectedItem?.id });

            if (formType === 'add') {
                await createCertificate(data);
                toast.success("Certificate added successfully");
            } else {
                await updateCertificate(selectedId, data);
                toast.success("Certificate updated successfully");
            }
            setIsFormModalOpen(false);
            fetchCertificates();
        } catch (error) {
            console.error('Certificate submission error:', error);
            const responseData = error?.response?.data;
            console.log("Raw backend error data:", responseData);

            const backendErrors = mapBackendErrors(error);
            console.log("Mapped field errors:", backendErrors);

            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            } else {
                const msg = extractErrorMessage(error, 'Failed to save certificate');
                toast.error(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deleteCertificate(selectedItem._id || selectedItem.id);
            toast.success("Certificate deleted successfully");
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
                            alt={row.title || row.certificateName}
                            crossOrigin="anonymous"
                            className="h-full w-full rounded object-cover"
                            onError={(e) => {
                                e.target.src = "/upload-placeholder.png";
                                toast.error('Unable to load certificate image');
                            }}
                        />
                    </div>
                );
            },
        },
        {
            key: "title",
            label: "Certificate Title",
            className: "max-w-[250px] truncate",
            render: (value, row) => {
                const title = value || row.certificateName || "—";
                return (
                    <div className="font-medium text-gray-900 truncate" title={title}>
                        {title}
                    </div>
                );
            },
        },
        {
            key: "issueDate",
            label: "Issue Date",
            render: (value, row) => {
                const date = value || row.IssueDate;
                return <div className="text-sm text-gray-500">{date ? new Date(date).toLocaleDateString() : 'N/A'}</div>;
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
                            onClick={() => window.open(buildImageUrl(row.certificateImage), '_blank')}
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
                <div className="order-1 sm:order-1 col-span-1 sm:w-auto flex-1 md:max-w-md">
                    <DynamicSearch
                        value={searchTerm}
                        onChange={(val) => {
                            setSearchTerm(val);
                            setCurrentPage(1);
                        }}
                        placeholder="Search certificates..."
                    />
                </div>
                <div className="order-2 sm:order-4 col-span-1 sm:w-auto flex justify-end sm:ml-auto md:ml-0 flex-col sm:flex-row items-end sm:items-center">
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
                {statuses.length > 1 && (
                    <div className="order-3 sm:order-2 col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-40">
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
                )}
                <div className="order-4 sm:order-3 col-span-1 sm:w-auto flex justify-end md:hidden">
                    <DynamicButton
                        icon={FiPlus}
                        onClick={handleAddNew}
                        className="w-auto md:w-52 md:h-11 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                    >
                        <span className="hidden sm:inline">Add Certificate</span>
                        <span className="sm:hidden">Add</span>
                    </DynamicButton>
                </div>
            </div>

            <div>
                <DynamicTable columns={columns} rows={currentData} />
            </div>

            <div className="flex flex-col bg-white py-3 rounded-b-lg shadow   sm:flex-row justify-between items-center md:px-8 gap-4 pt-2">
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

            {/* Modals */}
            <FormModal
                open={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                title={formType === 'add' ? 'Add New Certificate' : 'Edit Certificate'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Add Certificate' : 'Save Changes'}
                size="lg"
                errors={errors}
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
