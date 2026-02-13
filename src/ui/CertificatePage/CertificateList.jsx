import { useState, useMemo } from "react";
import { FiPlus, FiEye, FiTrash2 } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import DynamicTable from "../DynamicTable";
import DynamicDropdown from "../DynamicDropdown";
import DynamicButton from "../DynamicButton";
import DynamicSearch from "../DynamicSearch";
import Pagination from "../Pagination";
import Badge from "../Badge";
import { CertificatesData } from "../../data/CertificatesData";
import { exportToCSV } from "../../utils/csvExport";
import { FormModal } from "../modals/FormModal";
import { DeleteModal } from "../modals/DeleteModal";
import { CertificateForm } from "../forms/CertificateForm";

function CertificateList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All Types");
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

    const types = useMemo(() => ["All Types", ...new Set(CertificatesData.map(s => s.type))], []);
    const statuses = useMemo(() => ["All Status", ...new Set(CertificatesData.map(s => s.status))], []);

    const filteredData = useMemo(() => {
        return CertificatesData.filter((item) => {
            const matchesSearch = item.certificateName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === "All Types" || item.type === typeFilter;
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [searchTerm, typeFilter, statusFilter]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExportCSV = () => {
        exportToCSV(filteredData, "Certificates", {
            certificateName: "Certificate Name",
            type: "Type",
            issueDate: "Issue Date",
            from: "From",
            status: "Status"
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
            console.log(`Certificate ${formType === 'add' ? 'added' : 'updated'}:`, formData);
            setIsSubmitting(false);
            setIsFormModalOpen(false);
        }, 1000);
    };

    const handleDeleteConfirm = () => {
        setIsDeleting(true);
        // Simulate API call
        setTimeout(() => {
            console.log("Certificate deleted:", selectedItem.id);
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }, 1000);
    };

    // Columns: Preview,  certificate, type , issue date,  from , status, action
    const columns = [
        {
            key: "thumbnail",
            label: "Image",
            render: (value, row) => (
                <div className="flex-shrink-0 h-14 w-14">
                    <img
                        src={value}
                        alt={row.certificateName}
                        className="h-full w-full rounded object-cover"
                    />
                </div>
            ),
        },
        {
            key: "certificateName",
            label: "Certificate Name",
            render: (value) => <div className="font-medium text-gray-900">{value}</div>,
        },
        {
            key: "type",
            label: "Type",
            render: (value) => <span className="text-sm text-gray-700">{value}</span>,
        },
        {
            key: "issueDate",
            label: "Issue Date",
            render: (value) => <div className="text-sm text-gray-500">{value}</div>,
        },
        {
            key: "from",
            label: "From",
            render: (value) => <div className="text-sm text-gray-700">{value}</div>,
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
                    className="w-full sm:w-auto md:w-52 lg:w-52 xl:w-52 md:h-12 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
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
                    <div className="w-full sm:w-40">
                        <DynamicDropdown
                            options={types.filter((s) => s !== "All Types")}
                            value={typeFilter}
                            onChange={(val) => {
                                setTypeFilter(val);
                                setCurrentPage(1);
                            }}
                            defaultOption="All Types"
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
                itemName={selectedItem?.certificate}
                image={selectedItem?.preview}
                isDeleting={isDeleting}
            />
        </div>

    );
}

export default CertificateList;
