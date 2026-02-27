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
import { getAllCertificates, createCertificate, updateCertificate, deleteCertificate, BASE_URL, buildImageUrl } from "../../api/api";
import { toast } from "sonner";

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

    // Apply frontend search and filter only to currently fetched page,
    // or if the backend supports filter, it should be passed in params.
    // For now, based on Postman docs, backend only supports page and sort.
    const filteredData = useMemo(() => {
        return certificates.filter((item) => {
            const name = item.title || item.certificateName || "";
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
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
        setFormData({ status: 'Active', issuedBy: '' });
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        setSelectedId(item._id ?? item.id);

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
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();

        // Append image only if user has chosen a new file.  The API accepts
        // an uploaded file; sending the existing URL is unnecessary and may be
        // rejected by strict multipart parsers.
        if (formData.certificate instanceof File) {
            data.append('certificateImage', formData.certificate);
        }

        // Map frontend fields to backend expected fields
        const payload = {
            // include both naming schemes so API will accept either
            certificateName: formData.title || formData.certificateName || "",
            title: formData.title || formData.certificateName || "",
            certificateType: formData.description || formData.certificateType || "",
            description: formData.description || formData.certificateType || "",
            certificateFrom: formData.issuedBy || formData.certificateFrom || "",
            issuedBy: formData.issuedBy || formData.certificateFrom || "",
            IssueDate: formData.issueDate || formData.IssueDate || "",
            issueDate: formData.issueDate || formData.IssueDate || "",
            status: formData.status || "Active"
        };

        Object.keys(payload).forEach(key => {
            if (payload[key]) {
                data.append(key, payload[key]);
            }
        });

        // debug: log formdata entries
        for (let pair of data.entries()) {
            console.log('form data', pair[0], pair[1]);
        }

        try {
            // no role check (all users allowed)

            console.log('submitting certificate form', { formType, id: selectedItem?._id || selectedItem?.id, payload, file: formData.certificate });
            if (formType === 'add') {
                const res = await createCertificate(data);
                console.log('createCertificate response', res);
                toast.success("Certificate added successfully");
            } else {
                const res = await updateCertificate(selectedId, data);
                console.log('updateCertificate response', res);
                toast.success("Certificate updated successfully");
            }
            setIsFormModalOpen(false);
            fetchCertificates();
        } catch (error) {
            console.error('certificate submit error', error);
            const msg = error.response?.data?.message || error.message || 'Request failed';
            // display special message for 403
            if (error.response?.status === 403) {
                toast.error('Forbidden: you may not have sufficient rights');
            } else {
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
            render: (value, row) => <div className="font-medium text-gray-900">{value || row.certificateName}</div>,
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
                    onClick={handleAddNew}
                    className="w-full sm:w-auto md:w-52 lg:w-44 xl:w-52 md:h-12 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                >
                    Add New Certificate
                </DynamicButton>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-16 pb-8">
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
                    <div className="w-full sm:w-36">
                        <DynamicDropdown
                            options={["Active", "Inactive"]}
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
            >
                <CertificateForm
                    formData={formData}
                    onChange={setFormData}
                />
            </FormModal>

            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                entityName="Certificate"
                itemName={selectedItem?.title || selectedItem?.certificateName}
                image={selectedItem?.certificateImage}
                isDeleting={isDeleting}
            />
        </div>

    );
}

export default CertificateList;
