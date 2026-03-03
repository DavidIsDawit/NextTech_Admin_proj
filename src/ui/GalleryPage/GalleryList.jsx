import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiEye, FiTrash2, FiPlay } from "react-icons/fi";
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
import { getAllGallery, addGallery, deleteGallery } from "../../api/galleryApi";

// Helper to extract the most useful error message from a backend error
const extractErrorMessage = (error, fallback = "An error occurred") => {
    const data = error?.response?.data;
    if (!data) return error?.message || fallback;

    // Backend validation errors can come as: { message, fields } or { errors: [...] }
    if (data.message) return data.message;
    if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.map((e) => e.message || e.msg || e).join(", ");
    }
    return fallback;
};

function GalleryList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Data State
    const [gallery, setGallery] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchGallery = async () => {
        setIsLoading(true);
        try {
            const result = await getAllGallery({ page: currentPage, limit: 100 });
            if (result.status === "success") {
                // normalizeGallery in galleryApi.js already applies buildImageUrl
                setGallery(result.data || []);
            } else {
                toast.error(result.message || "Failed to fetch gallery");
            }
        } catch (error) {
            toast.error(extractErrorMessage(error, "Failed to fetch gallery"));
            console.error("Failed to fetch gallery:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery();
    }, []);

    const categories = useMemo(
        () => ["All Categories", ...new Set(gallery.map((s) => s.catagory || s.category).filter(Boolean))],
        [gallery]
    );
    const statuses = useMemo(
        () => ["All Status", ...new Set(gallery.map((s) => s.status).filter(Boolean))],
        [gallery]
    );

    const filteredData = useMemo(() => {
        return gallery.filter((item) => {
            const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory =
                categoryFilter === "All Categories" ||
                (item.catagory || item.category) === categoryFilter;
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [searchTerm, categoryFilter, statusFilter, gallery]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleExportCSV = () => {
        exportToCSV(filteredData, "Gallery", {
            title: "Media Title",
            fileType: "File Type",
            createdDate: "Upload Date",
            catagory: "Category",
            status: "Status",
        });
    };

    // Modal Handlers
    const handleAddNew = () => {
        setFormData({ status: "Active" });
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Validate required cover image
            if (!formData.coverImage || !(formData.coverImage instanceof File)) {
                toast.error("Cover image is required");
                setIsSubmitting(false);
                return;
            }

            const data = new FormData();
            data.append("coverImage", formData.coverImage);

            // Append additional gallery images if present
            if (Array.isArray(formData.images)) {
                formData.images.forEach((img) => {
                    if (img instanceof File) data.append("images", img);
                });
            }

            // Append text fields
            const textFields = ["title", "catagory", "fileType", "status"];
            textFields.forEach((key) => {
                if (formData[key] !== undefined && formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });

            const result = await addGallery(data);

            if (result.status === "success") {
                toast.success("Gallery item added successfully!");
                setIsFormModalOpen(false);
                setFormData({});
                await fetchGallery();
            } else {
                // Surface the backend message if present
                toast.error(result.message || "Failed to add gallery item");
            }
        } catch (error) {
            toast.error(extractErrorMessage(error, "Failed to add gallery item"));
            console.error("Gallery add error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            const id = selectedItem?._id || selectedItem?.id;
            const result = await deleteGallery(id);

            if (result.status === "success") {
                toast.success("Gallery item deleted successfully!");
                setIsDeleteModalOpen(false);
                setSelectedItem(null);
                await fetchGallery();
            } else {
                toast.error(result.message || "Failed to delete gallery item");
            }
        } catch (error) {
            toast.error(extractErrorMessage(error, "Failed to delete gallery item"));
            console.error("Gallery delete error:", error);
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
                        alt={row.title || row.mediaTitle}
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
            label: "Media Title",
            render: (value) => <div className="font-medium text-gray-900">{value}</div>,
        },
        {
            key: "fileType",
            label: "File Type",
            render: (value) => (
                <span className="text-sm text-gray-500 uppercase">{value}</span>
            ),
        },
        {
            key: "createdDate",
            label: "Upload Date",
            render: (value, row) => (
                <div className="text-sm text-gray-500">
                    {value ? new Date(value).toLocaleDateString() : row.uploadDate || "N/A"}
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl lg:text-3xl 2xl:text-4xl font-bold text-gray-900">
                        Gallery and Video Management Center
                    </h1>
                    <p className="text-base text-gray-500 mt-3">
                        Manage engineering services, technical offerings, and project capabilities
                    </p>
                </div>
                <DynamicButton
                    icon={FiPlus}
                    onClick={handleAddNew}
                    className="w-full sm:w-auto md:w-52 lg:w-44 xl:w-52 md:h-12 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                >
                    Add New Media
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
                            placeholder="Search Media..."
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
                        {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                    </span>
                    -
                    <span className="font-medium text-gray-900">
                        {Math.min(currentPage * itemsPerPage, filteredData.length)}
                    </span>{" "}
                    of <span className="font-medium text-gray-900">{filteredData.length}</span>{" "}
                    Media
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
                title="Add New Media"
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel="Add Media"
                size="lg"
            >
                <MediaForm formData={formData} onChange={setFormData} />
            </FormModal>

            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                entityName="Media"
                itemName={selectedItem?.title}
                image={selectedItem?.coverImage}
                isDeleting={isDeleting}
            />
        </div>
    );
}

export default GalleryList;
