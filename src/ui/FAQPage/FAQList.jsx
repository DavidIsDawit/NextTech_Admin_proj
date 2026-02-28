import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiEye, FiTrash2 } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import DynamicTable from "../DynamicTable";
import DynamicDropdown from "../DynamicDropdown";
import DynamicButton from "../DynamicButton";
import DynamicSearch from "../DynamicSearch";
import Pagination from "../Pagination";
import Badge from "../Badge";
import { toast } from "sonner";
import { getAllFAQs, createFAQ, updateFAQ, deleteFAQ } from "../../api/faqApi";
import { exportToCSV } from "../../utils/csvExport";
import { FormModal } from "../modals/FormModal";
import { FAQForm } from "../forms/FAQForm";

function FAQList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formType, setFormType] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({});

    const [faqs, setFaqs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFAQs = async () => {
        setIsLoading(true);
        try {
            const params = {};
            if (categoryFilter !== "All Categories") params.catagory = categoryFilter;
            if (statusFilter !== "All Status") params.status = statusFilter;

            const response = await getAllFAQs(params);
            if (response.status === "success") {
                setFaqs(response.data || []);
            }
        } catch (error) {
            toast.error("Failed to fetch FAQs");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFAQs();
    }, [categoryFilter, statusFilter]);

    const categories = useMemo(() => {
        const base = ["All Categories"];
        const unique = faqs.map(f => f.catagory || f.category).filter(Boolean);
        return [...base, ...new Set(unique)];
    }, [faqs]);

    const statuses = ["All Status", "published", "draft", "schedule", "archived"];

    const filteredData = useMemo(() => {
        return faqs.filter((item) => {
            const questionText = item.question || "";
            const matchesSearch = questionText.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, faqs]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExportCSV = () => {
        exportToCSV(filteredData, "FAQ", {
            question: "Question",
            catagory: "Category",
            createdDate: "Creation Date",
            status: "Status"
        });
    };

    // Modal Handlers
    const handleAddNew = () => {
        setFormType('add');
        setFormData({ status: 'published' });
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        // Map backend 'catagory' to frontend 'category' for form if needed
        setFormData({ ...item, category: item.catagory || item.category });
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                question: formData.question,
                answer: formData.answer,
                catagory: formData.category || formData.catagory,
                status: formData.status
            };

            let response;
            if (formType === 'add') {
                response = await createFAQ(payload);
            } else {
                const id = selectedItem._id || selectedItem.id;
                response = await updateFAQ(id, payload);
            }

            if (response.status === "success") {
                toast.success(`FAQ ${formType === 'add' ? 'added' : 'updated'} successfully!`);
                setIsFormModalOpen(false);
                fetchFAQs();
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to save FAQ";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };


    // Columns: question, category, create date, status, action
    const columns = [

        {
            key: "question",
            label: "Question",
            render: (value) => <div className="font-medium text-gray-900 truncate max-w-xs" title={value}>{value}</div>,
        },
        {
            key: "catagory",
            label: "Category",
            render: (value, row) => <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-yellow-50 text-yellow-700">{value || row.category}</span>,
        },
        {
            key: "createdDate",
            label: "Created",
            render: (value) => <div className="text-sm text-gray-500">{value ? new Date(value).toLocaleDateString() : "N/A"}</div>,
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
                <DynamicButton
                    icon={FiPlus}
                    onClick={handleAddNew}
                    className="w-full sm:w-auto md:w-52 lg:w-44 xl:w-52 md:h-12 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                >
                    Add New FAQ
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
                <DynamicButton
                    variant="secondary"
                    onClick={handleExportCSV}
                    className="w-full sm:w-auto justify-center sm:justify-end text-sm font-medium"
                >
                    Export CSV
                </DynamicButton>
            </div>

            <div>
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00A3E0]"></div>
                    </div>
                ) : (
                    <DynamicTable columns={columns} rows={currentData} />
                )}
            </div>

            <div className="flex flex-col bg-white py-3 rounded-b-lg shadow   sm:flex-row justify-between items-center md:px-8 gap-4 pt-2">
                <div className="text-sm text-gray-500 order-2 sm:order-1">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {faqs.length > 0
                            ? (currentPage - 1) * itemsPerPage + 1
                            : 0}
                    </span>
                    -
                    <span className="font-medium text-gray-900">
                        {Math.min(currentPage * itemsPerPage, faqs.length)}
                    </span>{" "}
                    of <span className="font-medium text-gray-900">{faqs.length}</span>{" "}
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
                    setFormData={setFormData}
                />
            </FormModal>

        </div>

    );
}

export default FAQList;
