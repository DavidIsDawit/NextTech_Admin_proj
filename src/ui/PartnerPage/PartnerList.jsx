import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiEye, FiTrash2 } from "react-icons/fi";
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
import { getAllPartners, createPartner, updatePartner, deletePartner } from "../../api/partnerApi";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";
import { toast } from "sonner";

function PartnerList() {
    const [partners, setPartners] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPartners, setTotalPartners] = useState(0);
    const itemsPerPage = 10;

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formType, setFormType] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [errors, setErrors] = useState({});

    const [selectedId, setSelectedId] = useState(null);

    const fetchPartners = async () => {
        setIsLoading(true);
        try {
            const params = { page: currentPage, limit: itemsPerPage, sort: 'recent' };
            const data = await getAllPartners(params);
            if (data.status === "success") {
                setPartners(data.data || []);
                setTotalPartners(data.totalPartners || 0);
            }
        } catch (error) {
            console.error("Failed to fetch partners:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [currentPage]);

    const statuses = useMemo(() => ["All Status", ...new Set(partners.map(s => s.status).filter(Boolean))], [partners]);

    const filteredData = useMemo(() => {
        return partners.filter((item) => {
            const name = item.partnerName || item.company || item.name || "";
            const matchesSearch = searchTerm.length < 3 || name.toLowerCase().includes(searchTerm.toLowerCase());
            const status = item.status || "Active";
            const matchesStatus = statusFilter === "All Status" || status.toLowerCase() === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, partners]);

    const totalPages = Math.ceil(totalPartners / itemsPerPage);
    const currentData = filteredData;

    const handleExportCSV = () => {
        exportToCSV(filteredData, "Partners", {
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

        setFormData({
            ...item,
            partnerImage: item.partnerImage || item.image || item.partnerFile || '',
            partnerName: item.partnerName || item.company || item.name || '',
            status: item.status || 'Active'
        });
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

        const localErrors = {};
        const partnerName = formData.partnerName || "";
        if (!partnerName.trim()) {
            localErrors.partnerName = "Partner Name is required";
        }

        if (formType === 'add' && !(formData.partnerImage instanceof File)) {
            localErrors.partnerImage = "Partner Image is required";
        }

        if (Object.keys(localErrors).length > 0) {
            setErrors(localErrors);
            return;
        }

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
            console.log('Submitting partner...', { formType, name: partnerName });
            const payload = {};
            for (let [key, value] of data.entries()) {
                payload[key] = value instanceof File ? `File: ${value.name}` : value;
            }
            console.log("Partner Payload:", payload);

            if (formType === 'add') {
                const res = await createPartner(data);
                if (res.status === "success") {
                    toast.success("Partner added successfully");
                    fetchPartners();
                    setIsFormModalOpen(false);
                } else {
                    toast.error(res.message || "Failed to add partner");
                }
            } else {
                const res = await updatePartner(selectedId, data);
                if (res.status === "success") {
                    toast.success("Partner updated successfully");
                    fetchPartners();
                    setIsFormModalOpen(false);
                } else {
                    toast.error(res.message || "Failed to update partner");
                }
            }
        } catch (error) {
            console.error("Partner submission error:", error);
            const backendErrors = mapBackendErrors(error);
            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            } else {
                toast.error(extractErrorMessage(error, "Failed to save partner"));
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
                toast.success("Partner deleted successfully");
                fetchPartners();
                setIsDeleteModalOpen(false);
            } else {
                toast.error(res.message || "Failed to delete partner");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
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
                        onClick={() => console.log("View", row._id || row.id)}
                        title="View"
                    >
                        <FiEye size={21} />
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
                <div className="order-1 sm:order-1 col-span-1 sm:w-auto flex-1 md:max-w-md">
                    <DynamicSearch
                        value={searchTerm}
                        onChange={(val) => {
                            setSearchTerm(val);
                            setCurrentPage(1);
                        }}
                        placeholder="Search partners..."
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
                    <div className="order-3 sm:order-2 col-span-1 sm:w-36 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none">
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
                <div className="order-4 sm:order-3 col-span-1 sm:w-auto flex justify-end md:hidden">
                    <DynamicButton
                        icon={FiPlus}
                        onClick={handleAddNew}
                        className="w-auto md:w-48 md:h-11 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                    >
                        <span className="hidden sm:inline">Add Partner</span>
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
                    partners
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
                submitLabel={formType === 'add' ? 'Add Partner' : 'Save Changes'}
                size="lg"
                errors={errors}
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
