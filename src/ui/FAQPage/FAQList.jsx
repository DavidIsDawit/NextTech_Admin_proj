import { useState, useMemo } from "react";
import { FiPlus, FiEye, FiTrash2 } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import DynamicTable from "../DynamicTable";
import DynamicDropdown from "../DynamicDropdown";
import DynamicSearch from "../DynamicSearch";
import { Button } from "../button";
import { Input } from "../input";
import Pagination from "../Pagination";
import { Badge } from "../badge";
import { FAQData } from "../../data/FAQData";
import { exportToCSV } from "../../utils/csvExport";
import { FormModal } from "../modals/FormModal";
import { DeleteModal } from "../modals/DeleteModal";
import { FAQForm } from "../forms/FAQForm";

function FAQList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
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

    const categories = useMemo(() => ["All Categories", ...new Set(FAQData.map(s => s.category))], []);
    const statuses = useMemo(() => ["All Status", ...new Set(FAQData.map(s => s.status))], []);

    const filteredData = useMemo(() => {
        return FAQData.filter((item) => {
            const matchesSearch = item.question?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "All Categories" || item.category === categoryFilter;
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [searchTerm, categoryFilter, statusFilter]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExportCSV = () => {
        exportToCSV(filteredData, "FAQ", {
            question: "Question",
            category: "Category",
            lastUpdated: "Last Updated",
            publishDate: "Publish Date",
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
            console.log(`FAQ ${formType === 'add' ? 'added' : 'updated'}:`, formData);
            setIsSubmitting(false);
            setIsFormModalOpen(false);
        }, 1000);
    };

    const handleDeleteConfirm = () => {
        setIsDeleting(true);
        // Simulate API call
        setTimeout(() => {
            console.log("FAQ deleted:", selectedItem.id);
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }, 1000);
    };

    // Columns: Icon, question, category, last updated,  publish date,  status, action
    const columns = [
        {
            key: "icon",
            label: "Icon",
            render: (Icon, row) => <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500"><Icon size={20} /></div>,
        },
        {
            key: "question",
            label: "Question",
            render: (value) => <div className="font-medium text-gray-900 truncate max-w-xs" title={value}>{value}</div>,
        },
        {
            key: "category",
            label: "Category",
            render: (value) => (
                <Badge variant="secondary" className="font-medium whitespace-nowrap">
                    {value}
                </Badge>
            ),
        },
        {
            key: "lastUpdated",
            label: "Last Updated",
            render: (value) => <div className="text-sm text-gray-500">{value}</div>,
        },
        {
            key: "publishDate",
            label: "Publish Date",
            render: (value) => <div className="text-sm text-gray-500">{value}</div>,
        },
        {
            key: "status",
            label: "Status",
            render: (value) => {
                const variantMap = {
                    active: "success",
                    Active: "success",
                    inactive: "error",
                    Inactive: "error"
                };
                return <Badge variant={variantMap[value] || "default"}>{value}</Badge>;
            },
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
                        FAQ Management
                    </h1>
                    <p className="text-base text-gray-500 mt-3">
                        Manage frequently asked questions
                    </p>
                </div>
                <Button
                    onClick={handleAddNew}
                    className="w-full sm:w-auto md:w-52 lg:w-44 xl:w-52 md:h-12 bg-[#00A3E0] hover:bg-blue-600 text-white"
                >
                    <FiPlus className="mr-2 h-5 w-5" />
                    Add New FAQ
                </Button>
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
                            placeholder="Search FAQs..."
                        />
                    </div>
                    <div className="w-full sm:w-40">
                        <DynamicDropdown
                            options={categories.filter((s) => s !== "All Categories")}
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
                <Button
                    variant="export"
                    onClick={handleExportCSV}
                    className="w-full sm:w-auto text-sm font-medium"
                >
                    Export CSV
                </Button>
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
                    FAQs
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
                title={formType === 'add' ? 'Add New FAQ' : 'Edit FAQ'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Add FAQ' : 'Save Changes'}
                size="lg"
            >
                <FAQForm
                    formData={formData}
                    onChange={setFormData}
                />
            </FormModal>

            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                entityName="FAQ"
                itemName={selectedItem?.question}
                isDeleting={isDeleting}
            />
        </div>

    );
}

export default FAQList;
