import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { FiPlus, FiTrash2, FiPlay } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import DynamicTable from "../DynamicTable";
import DynamicDropdown from "../DynamicDropdown";
import DynamicButton from "../DynamicButton";
import DynamicSearch from "../DynamicSearch";
import Pagination from "../Pagination";
import Badge from "../Badge";
import { toast } from "sonner";
import { exportToCSV } from "../../utils/csvExport";
import { FormModal } from "../modals/FormModal";
import { DeleteModal } from "../modals/DeleteModal";
import { MediaForm } from "../forms/MediaForm";
import { getAllGallery, addGallery, updateGallery, deleteGallery, searchGallery, filterGalleryByCategory, filterGalleryByStatuses, getCategories, getStatuses } from "../../api/galleryApi";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";

// Helper to extract the most useful error message from a backend error - REMOVED, using shared helper
// Backend validation errors can come as: { message, fields } or { errors: [...] } - REMOVED, using shared helper

function GalleryList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categories, setCategories] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const statusParam = searchParams.get("status");
    const categoryParam = searchParams.get("category") || searchParams.get("specialty");

    const statusFilter = statusParam
        ? (statusParam.toLowerCase() === "active" ? "Active" : statusParam.toLowerCase() === "inactive" ? "Inactive" : statusParam)
        : "All Status";
    const categoryFilter = categoryParam || "All Categories";

    const itemsPerPage = 8;

    const setFiltersAndPage = ({ status, category, page }) => {
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

            const newCategory = category !== undefined ? category : (searchParams.get("category") || searchParams.get("specialty") || "All Categories");
            if (newCategory && newCategory !== "All Categories" && newCategory !== "All Specialties") {
                next.set("category", newCategory);
            } else {
                next.delete("category");
            }

            return next;
        }, { replace: true });
    };

    const setCurrentPage = (page) => {
        setFiltersAndPage({ page });
    };

    // Data State
    const [gallery, setGallery] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
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
    const initialFormDataRef = useRef(null);

    // Compare form data for isChanged (handles File objects)
    const getComparableData = (data) => {
        const clone = { ...data };
        Object.keys(clone).forEach(key => {
            if (clone[key] instanceof File) clone[key] = '__file__';
            if (Array.isArray(clone[key])) {
                clone[key] = clone[key].map(item => item instanceof File ? '__file__' : item);
            }
        });
        return JSON.stringify(clone);
    };

    // Debounced search
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchGallery = async () => {
        const search = debouncedSearchTerm.trim();
        if (search.length > 0 && search.length < 3) {
            return;
        }

        setIsLoading(true);
        try {
            let result;
            const params = { page: currentPage, limit: itemsPerPage };
            if (statusFilter !== "All Status") {
                params.status = statusFilter;
            }
            if (categoryFilter !== "All Categories") {
                params.category = categoryFilter;
                params.catagory = categoryFilter;
            }

            if (search.length >= 3) {
                result = await searchGallery(search, params);
            } else if (categoryFilter !== "All Categories" && statusFilter !== "All Status") {
                result = await getAllGallery(params);
            } else if (categoryFilter !== "All Categories") {
                result = await filterGalleryByCategory(categoryFilter, params);
            } else if (statusFilter !== "All Status") {
                result = await filterGalleryByStatuses(statusFilter, params);
            } else {
                result = await getAllGallery(params);
            }

            if (result && result.status === "success") {
                const galleryItems = result.data || [];
                const isClientSideSliced = galleryItems.length > itemsPerPage;
                const total = isClientSideSliced
                    ? galleryItems.length
                    : (result.total ?? galleryItems.length);

                setTotalItems(total);

                if (isClientSideSliced) {
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    setGallery(galleryItems.slice(startIndex, startIndex + itemsPerPage));
                } else {
                    setGallery(galleryItems);
                }

                setTotalPages(Math.ceil(total / itemsPerPage) || 1);
            } else {
                if (result?.message) toast.error(result.message);
            }
        } catch (error) {
            console.error("Failed to fetch gallery:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery();
    }, [currentPage, debouncedSearchTerm, categoryFilter, statusFilter]);

    useEffect(() => {
        const fetchCategories = async () => {
            const result = await getCategories();
            if (result.status === "success") {
                setCategories(result.data);
            }
        }; fetchCategories();
    }, []);

    useEffect(() => {
        const fetchStatuses = async () => {
            const result = await getStatuses();
            if (result.status === "success") {
                setStatuses(result.data);
            }
        }; fetchStatuses();
    }, []);

    const currentData = useMemo(() => {
        return gallery.filter((item) => {
            const itemCat = item.catagory || item.category || "";
            const itemStatus = item.status || "";

            const catMatch = categoryFilter === "All Categories" || itemCat.toLowerCase() === categoryFilter.toLowerCase();
            const statusMatch = statusFilter === "All Status" || itemStatus.toLowerCase() === statusFilter.toLowerCase();

            return catMatch && statusMatch;
        });
    }, [gallery, categoryFilter, statusFilter]);


    const handleExportCSV = () => {
        const exportData = gallery.map((item) => ({
            title: item.title || "—",
            description: item.description || "—",
            fileType: item.fileType,
            uploadDate: item.Date || item.createdDate || item.createdAt,
            catagory: item.catagory || item.category,
            status: item.status,
        }));

        exportToCSV(exportData, "Gallery", {
            title: "Title",
            description: "Description",
            fileType: "File Type",
            uploadDate: "Upload Date",
            catagory: "Category",
            status: "Status",
        });
    };

    // Modal Handlers
    const handleAddNew = () => {
        setFormType('add');
        setFormData({
            title: '',
            description: '',
            fileType: '',
            catagory: '',
            status: 'Active',
            coverImage: null,
            images: []
        });
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        const data = {
            title: item.title || '',
            description: item.description || '',
            fileType: item.fileType || '',
            catagory: item.catagory || item.category || '',
            status: item.status || 'Active',
            coverImage: item.coverImage || item.image || item.thumbnail || null,
            images: item.images || item.galleryImages || item.mediaImages || [],
            Date: item.Date || item.createdDate || item.createdAt || ''
        };
        setFormData(data);
        initialFormDataRef.current = getComparableData(data);
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
            const requiredFields = {
                title: 'Title is required.',
                description: 'Description is required.',
                catagory: 'Category is required.',
            };
            if (formType === 'add') {
                requiredFields.coverImage = 'Cover image is required.';
                requiredFields.fileType = 'File type is required.';
            }
            const validationErrors = Object.entries(requiredFields).reduce((fieldErrors, [field, message]) => {
                const value = formData[field];
                if (value === null || value === undefined || String(value).trim() === '') {
                    fieldErrors[field] = message;
                }
                return fieldErrors;
            }, {});

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            const data = new FormData();

            // Only append coverImage if it's a new file
            if (formData.coverImage instanceof File) {
                data.append("coverImage", formData.coverImage);
            }

            // Append additional gallery images if they are new files
            if (Array.isArray(formData.images)) {
                formData.images.forEach((img) => {
                    if (img instanceof File) data.append("images", img);
                });
            }

            // Append text fields
            data.append("catagory", formData.catagory);
            data.append("status", formData.status);
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("fileType", formData.fileType);


            let result;
            if (formType === 'add') {
                result = await addGallery(data);
            } else {
                const id = selectedItem?._id || selectedItem?.id;
                result = await updateGallery(id, data);
            }

            if (result.status === "success") {
                const msg = result?.message || result?.data?.message;
                if (msg) toast.success(msg);
                setIsFormModalOpen(false);
                setFormData({});
                await fetchGallery();
            } else {
                if (result.message) toast.error(result.message);
            }
        } catch (error) {
            const responseData = error?.response?.data;

            const backendErrors = mapBackendErrors(error);

            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            } else {
                if (error?.response?.data?.message) toast.error(error.response.data.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            const id = selectedItem?._id || selectedItem?._id;
            const result = await deleteGallery(id);

            if (result.status === "success") {
                const msg = result?.message || result?.data?.message;
                if (msg) toast.success(msg);
                setIsDeleteModalOpen(false);
                setSelectedItem(null);
                await fetchGallery();
            } else {
                if (result.message) toast.error(result.message);
            }
        } catch (error) {
            if (error?.response?.data?.message) toast.error(error.response.data.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Columns: Media, MEDIA TITLE, FILE TYPE, UPLOAD DATE, CATEGORY, Status, Actions
    // NOTE: Edit action removed — no backend update endpoint in API documentation
    const columns = [
        {
            key: "coverImage",
            label: "Media",
            render: (value, row) => (
                <div className="relative flex-shrink-0 h-14 w-14">
                    <img
                        src={value || row.image || row.thumbnail}
                        alt=""
                        className="h-full w-full rounded object-cover"
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />
                    {(row.fileType === "video" ||
                        row.fileType === "MP4" ||
                        row.catagory === "Process Videos" ||
                        row.category === "Process Videos") && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/80 rounded-full p-2 shadow-sm border border-gray-100">
                                    <FiPlay size={12} className="text-gray-900 fill-current" />
                                </div>
                            </div>
                        )}
                </div>
            ),
        },
        {
            key: "title",
            label: "Title",
            render: (value) => <div className="font-medium text-gray-900 truncate max-w-[150px]" title={value}>{value || "—"}</div>,
        },
        {
            key: "description",
            label: "Description",
            render: (value) => <div className="text-sm text-gray-500 truncate max-w-[200px]" title={value}>{value || "—"}</div>,
        },
        {
            key: "fileType",
            label: "File Type",
            render: (value) => (
                <span className="text-sm text-gray-500 uppercase font-medium">{value || "—"}</span>
            ),
        },
        {
            key: "Date",
            label: "Upload Date",
            render: (value) => (
                <div className="text-sm text-gray-500">
                    {value ? new Date(value).toLocaleDateString() : "N/A"}
                </div>
            ),
        },
        {
            key: "catagory",
            label: "Category",
            render: (value, row) => {
                const displayValue = value || row.category;
                let colorClass = "bg-gray-100 text-gray-800";
                if (displayValue === "Site Photos") colorClass = "bg-blue-50 text-blue-600";
                if (displayValue === "Process Videos") colorClass = "bg-sky-100 text-sky-600";

                return (
                    <span
                        className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${colorClass}`}
                    >
                        {displayValue || "—"}
                    </span>
                );
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
                        className="p-1 text-gray-400 hover:text-[#00A3E0] rounded border border-gray-100 hover:bg-sky-50 transition-colors cursor-pointer"
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
                        Gallery Management Center
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-2">
                        Manage engineering services, technical offerings, and project capabilities
                    </p>
                </div>
                {/* Desktop Add Button */}
                <div className="hidden md:flex justify-end mt-2">
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-[#00A3E0] hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer"
                    >
                        <FiPlus size={18} />
                        Add Image
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
                        placeholder="Search gallery..."
                    />
                </div>
                <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-40">
                    <DynamicDropdown
                        options={categories.length > 0 ? categories : [...new Set(gallery.map(g => g.category).filter(Boolean))]}
                        value={categoryFilter}
                        defaultOption="All Categories"
                        onChange={(val) => {
                            setFiltersAndPage({ category: val, page: 1 });
                        }} />
                </div>
                <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-36">
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
                        <span className="hidden sm:inline">Add Image</span>
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
                    of <span className="font-medium text-gray-900">{totalItems}</span> Media
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
                title={formType === 'add' ? 'Add New Gallery Item' : 'Edit Gallery Item'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Add Item' : 'Update Item'}
                size="lg"
                errors={errors}
                formType={formType}
                isChanged={formType === 'add' || getComparableData(formData) !== initialFormDataRef.current}
            >
                <MediaForm formData={formData} onChange={setFormData} errors={errors} isEdit={formType === 'edit'} />
            </FormModal>

            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                entityName="Media"
                itemName={selectedItem?.catagory || selectedItem?.category || "Media Item"}
                image={selectedItem?.coverImage}
                isDeleting={isDeleting}
            />
        </div>
    );
}

export default GalleryList;
