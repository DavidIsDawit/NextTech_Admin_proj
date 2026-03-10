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
import { NewsForm } from "../forms/NewsForm";
import { getAllNews, createNews, updateNews, deleteNews } from "../../api/newsApi";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";
import { toast } from "sonner";

function NewsList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Data State
    const [news, setNews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formType, setFormType] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [errors, setErrors] = useState({});

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const result = await getAllNews({ page: currentPage, limit: 100 });
            if (result.status === "success") {
                // Handle both nested and direct data array
                const newsItems = result.data?.news || (Array.isArray(result.data) ? result.data : []);
                setNews(newsItems);
                setTotalItems(result.totalNews || result.count || newsItems.length || 0);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const categories = useMemo(() => ["All Categories", ...new Set(news.map(s => s.catagory || s.category).filter(Boolean))], [news]);
    const statuses = useMemo(() => ["All Status", ...new Set(news.map(s => s.status).filter(Boolean))], [news]);

    const filteredData = useMemo(() => {
        return news.filter((item) => {
            const title = item.title || item.articleTitle;
            const cat = item.catagory || item.category;
            const matchesSearch = searchTerm.length < 3 || title?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "All Categories" || cat === categoryFilter;
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [searchTerm, categoryFilter, statusFilter, news]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExportCSV = () => {
        exportToCSV(filteredData, "News", {
            title: "Article Title",
            catagory: "Category",
            author: "Author",
            happenedOn: "Publish Date",
            status: "Status"
        });
    };

    // Modal Handlers
    const handleAddNew = () => {
        setFormType('add');
        setFormData({
            title: '',
            catagory: 'company-news',
            author: '',
            descriptionOne: '',
            descriptionTwo: '',
            discriptionThree: '',
            discriptionFour: '',
            tags: '',
            happenedOn: '',
            status: 'draft',
            imageCover: null,
            images: []
        });
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        setFormData({ ...item });
        setErrors({});
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
        try {
            const data = new FormData();

            // Client side validation
            const clientErrors = {};
            if (formType === 'add' && !formData.imageCover) {
                clientErrors.imageCover = "Cover Image is required";
            }
            if (Object.keys(clientErrors).length > 0) {
                setErrors(clientErrors);
                setIsSubmitting(false);
                return;
            }

            // Only send fields the backend accepts (avoids 400 from _id, createdAt, etc.)
            const allowedFields = ['title', 'catagory', 'author', 'descriptionOne', 'descriptionTwo', 'discriptionThree', 'discriptionFour', 'tags', 'happenedOn', 'status'];

            // Always append allowed text fields
            allowedFields.forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });
            // Only append imageCover if a new file was selected
            if (formData.imageCover instanceof File) {
                data.append('imageCover', formData.imageCover);
            }
            // Only append gallery images if new files were selected
            if (Array.isArray(formData.images)) {
                formData.images.forEach(file => {
                    if (file instanceof File) data.append('images', file);
                });
            }

            for (const [key, value] of data.entries()) {
            }

            if (formType === 'add') {
                const res = await createNews(data);
                if (res.status === "success") {
                    toast.success("News article created successfully!");
                    await fetchNews();
                    setIsFormModalOpen(false);
                } else {
                    toast.error(res.message || "Failed to create news");
                }
            } else {
                const res = await updateNews(selectedItem._id || selectedItem.id, data);
                if (res.status === "success") {
                    toast.success("News article updated successfully!");
                    await fetchNews();
                    setIsFormModalOpen(false);
                } else {
                    toast.error(res.message || "Failed to update news");
                }
            }
        } catch (error) {
            const backendErrors = mapBackendErrors(error);
            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            } else {
                toast.error(extractErrorMessage(error, "Failed to save news article"));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deleteNews(selectedItem._id || selectedItem.id);
            await fetchNews();
            setIsDeleteModalOpen(false);
        } catch (error) {
        } finally {
            setIsDeleting(false);
        }
    };

    // Columns: Image , article title,  category, author, publish date, status, action
    const columns = [
        {
            key: "imageCover",
            label: "Image",
            render: (value, row) => (
                <div className="flex-shrink-0 h-14 w-14">
                    <img
                        src={value || row.image || row.thumbnail}
                        alt={row.title || row.articleTitle}
                        className="h-full w-full rounded object-cover"
                    />
                </div>
            ),
        },
        {
            key: "title",
            label: "Article Title",
            className: "max-w-[250px] truncate whitespace-nowrap",
            render: (value, row) => <div className="font-medium text-gray-900 truncate" title={value || row.articleTitle}>{value || row.articleTitle}</div>,
        },
        {
            key: "catagory",
            label: "Category",
            render: (value, row) => <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-indigo-50 text-indigo-700">{value || row.category}</span>,
        },
        {
            key: "author",
            label: "Author",
            render: (value, row) => <div className="text-sm text-gray-500">{value || row.authorName}</div>,
        },
        {
            key: "happenedOn",
            label: "Happened On",
            render: (value, row) => <div className="text-sm text-gray-500">{value || row.publishDate}</div>,
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
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 sm:mb-6 pt-2 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        News Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-2">
                        Manage articles and news updates
                    </p>
                </div>
                {/* Desktop Add Button */}
                <div className="hidden md:flex justify-end mt-2">
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-[#00A3E0] hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer"
                    >
                        <FiPlus size={18} />
                        Add Article
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
                        placeholder="Search news..."
                    />
                </div>
                {categories.length > 1 && (
                    <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-40">
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
                )}
                {statuses.length > 1 && (
                    <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-36">
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
                <div className="col-span-1 sm:w-auto flex justify-end">
                    <DynamicButton
                        variant="secondary"
                        onClick={handleExportCSV}
                        className="w-auto md:h-11 justify-center sm:justify-end text-sm font-medium"
                    >
                        <span className="hidden sm:inline">Export CSV</span>
                        <span className="sm:hidden">Export</span>
                    </DynamicButton>
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
                        {filteredData.length > 0
                            ? (currentPage - 1) * itemsPerPage + 1
                            : 0}
                    </span>
                    -
                    <span className="font-medium text-gray-900">
                        {Math.min(currentPage * itemsPerPage, filteredData.length)}
                    </span>{" "}
                    of <span className="font-medium text-gray-900">{filteredData.length}</span>{" "}
                    articles
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
                title={formType === 'add' ? 'Add New Article' : 'Edit Article'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Add Article' : 'Save Changes'}
                size="xl"
                errors={errors}
            >
                <NewsForm
                    formData={formData}
                    onChange={setFormData}
                    errors={errors}
                />
            </FormModal>

            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                entityName="Article"
                itemName={selectedItem?.title}
                image={selectedItem?.image}
                isDeleting={isDeleting}
            />
        </div>

    );
}

export default NewsList;
