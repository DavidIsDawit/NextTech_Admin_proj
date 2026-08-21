import { useState, useMemo, useEffect, useRef } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import DynamicTable from "../DynamicTable";
import DynamicDropdown from "../DynamicDropdown";
import DynamicButton from "../DynamicButton";
import DynamicSearch from "../DynamicSearch";
import Badge from "../Badge";
import { toast } from "sonner";
import { getAllFAQs, createFAQ, updateFAQ, deleteFAQ } from "../../api/faqApi";
import { exportToCSV } from "../../utils/csvExport";
import { FormModal } from "../modals/FormModal";
import { FAQForm } from "../forms/FAQForm";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";

function FAQList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(1000);

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formType, setFormType] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const initialFormDataRef = useRef(null);

    const [faqs, setFaqs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    const fetchFAQs = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: 1,
                limit: itemsPerPage
            };

            const response = await getAllFAQs(params);
            if (response.status === "success") {
                const faqItems = response.data || [];
                setFaqs(faqItems);
                setTotalItems(faqItems.length);
            }
        } catch (error) {
            console.error("Failed to fetch FAQs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFAQs();
    }, []);

    const categories = useMemo(() => {
        const base = ["All Categories"];
        const unique = faqs.map(f => f.catagory || f.category).filter(Boolean);
        return [...base, ...new Set(unique)];
    }, [faqs]);

    const statuses = useMemo(() => ["All Status", ...new Set(faqs.map(s => s.status).filter(Boolean))], [faqs]);

    // Frontend Filtering Logic
    const filteredFAQs = useMemo(() => {
        return faqs.filter((item) => {
            const matchesSearch = !searchTerm || searchTerm.length < 3 || 
                item.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.answer?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "All Categories" || (item.catagory || item.category) === categoryFilter;
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [faqs, searchTerm, categoryFilter, statusFilter]);

    const handleExportCSV = () => {
        exportToCSV(filteredFAQs, "FAQ", {
            question: "Question",
            catagory: "Category",
            createdDate: "Creation Date",
            status: "Status"
        });
    };

    // Modal Handlers
    const handleAddNew = () => {

        setFormType('add');
        setFormData({
            question: '',
            answer: '',
            category: '',
            status: 'draft'
        });
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        setErrors({});
        // Map backend 'catagory' to frontend 'category' for form
        const editData = {
            ...item,
            category: item.catagory || item.category || 'general',
            question: item.question || '',
            answer: item.answer || ''
        };
        setFormData(editData);
        initialFormDataRef.current = JSON.stringify(editData);
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setErrors({});

        // Frontend validation removed; relying on backend.

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
                const msg = response?.message || response?.data?.message;
                if (msg) toast.success(msg);
                setIsFormModalOpen(false);
                fetchFAQs();
            } else {
                // If backend returns status failure but 200 OK
                const msg = response.message || response?.data?.message || "Failed to save FAQ";
                toast.error(msg);
                // Try to extract errors if present in non-throwing case
                const manualMapped = mapBackendErrors({ response: { data: response } });
                if (Object.keys(manualMapped).length > 0) setErrors(manualMapped);
            }
        } catch (error) {
            const responseData = error?.response?.data;

            const backendErrors = mapBackendErrors(error);

            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            } else {
                const msg = extractErrorMessage(error, "Failed to save FAQ");
                toast.error(msg);
            }
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
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 sm:mb-6 pt-2 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        FAQ Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-2">
                        Manage frequently asked questions
                    </p>
                </div>
                {/* Desktop Add Button */}
                <div className="hidden md:flex justify-end mt-2">
                    {faqs.length < 5 ? (
                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-2 bg-[#00A3E0] hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer"
                        >
                            <FiPlus size={18} />
                            Add FAQ
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 bg-gray-100 text-gray-500 px-5 py-2.5 rounded-md font-medium text-sm">
                            Maximum 5 FAQs reached
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-row flex-wrap items-center sm:justify-between gap-3 sm:gap-4 pb-6">
                <div className="col-span-2 sm:w-auto flex-1 md:max-w-md">
                    <DynamicSearch
                        value={searchTerm}
                        onChange={(val) => {
                            setSearchTerm(val);
                        }}
                        placeholder="Search FAQs..."
                    />
                </div>
                {categories.length > 1 && (
                    <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-40">
                        <DynamicDropdown
                            options={categories.filter((s) => s !== "All Categories")}
                            value={categoryFilter}
                            onChange={(val) => {
                                setCategoryFilter(val);
                            }}
                            defaultOption="All Categories"
                        />
                    </div>
                )}
                {statuses.length > 1 && (
                    <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-36">
                        <DynamicDropdown
                            options={statuses.filter((s) => s !== "All Status")}
                            value={statusFilter}
                            onChange={(val) => {
                                setStatusFilter(val);
                            }}
                            defaultOption="All Status"
                        />
                    </div>
                )}
                <div className="col-span-1 sm:w-auto flex justify-start md:hidden">
                    {faqs.length < 5 ? (
                        <DynamicButton
                            icon={FiPlus}
                            onClick={handleAddNew}
                            className="w-auto md:w-52 md:h-11 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                        >
                            <span className="hidden sm:inline">Add FAQ</span>
                            <span className="sm:hidden">Add</span>
                        </DynamicButton>
                    ) : (
                        <div className="flex items-center justify-center bg-gray-100 text-gray-500 px-4 py-2 rounded-md font-medium text-sm">
                            Max 5 FAQs
                        </div>
                    )}
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
                    <DynamicTable columns={columns} rows={filteredFAQs} />
                )}
            </div>

            <div className="flex flex-col bg-white py-3 rounded-b-lg shadow   sm:flex-row justify-between items-center md:px-8 gap-4 pt-2">
                <div className="text-sm text-gray-500 order-2 sm:order-1">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {filteredFAQs.length}
                    </span>{" "}
                    FAQs
                </div>
            </div>

            {/* Modals */}
            <FormModal
                open={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                title={formType === 'add' ? 'Add New FAQ' : 'Edit FAQ'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Add FAQ' : 'Update FAQ'}
                size="lg"
                errors={errors}
                formType={formType}
                isChanged={formType === 'add' || JSON.stringify(formData) !== initialFormDataRef.current}
            >
                <FAQForm
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                />
            </FormModal>

        </div>

    );
}

export default FAQList;
