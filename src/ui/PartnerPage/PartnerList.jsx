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
import { PartnerForm } from "../forms/PartnerForm";
import { getAllPartners, createPartner, updatePartner, deletePartner } from "../../api/partnerApi";
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

    const statuses = useMemo(() => ["All Status", "Active", "Inactive"], []);

    const filteredData = useMemo(() => {
        return partners.filter((item) => {
            const name = item.partnerName || item.company || item.name || "";
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
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
        setFormData({ status: 'Active' });
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        setSelectedId(item._id || item.id);

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
        e?.preventDefault?.();

        const partnerName = formData.partnerName || "";
        if (!partnerName.trim()) {
            toast.error("Partner Name is required");
            return;
        }

        if (formType === 'add' && !(formData.partnerImage instanceof File)) {
            toast.error("Partner Image is required");
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
            toast.error(error.response?.data?.message || "An error occurred");
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
            render: (value, row) => <div className="font-medium text-gray-900">{value || row.company || row.name}</div>,
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl lg:text-3xl 2xl:text-4xl font-bold text-gray-900">
                        Partner Management
                    </h1>
                    <p className="text-base text-gray-500 mt-3">
                        Manage partners and affiliates
                    </p>
                </div>
                <DynamicButton
                    icon={FiPlus}
                    onClick={handleAddNew}
                    className="w-full sm:w-auto md:w-52 lg:w-44 xl:w-52 md:h-12 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                >
                    Add New Partner
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
                            placeholder="Search partners..."
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
            >
                <PartnerForm
                    formData={formData}
                    onChange={setFormData}
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
