import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";
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
import { TestimonialForm } from "../forms/TestimonialForm";
import { getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, searchTestimonials, filterTestimonialsBySpecialty, getSpecialties, getStatuses, filterTestimonialsByStatus } from "../../api/api_testimonial";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";
import { toast } from "sonner";

function TestimonialList() {
    const [isLoading, setIsLoading] = useState(false);
    const [specialties, setSpecialties] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [specialtyFilter, setSpecialtyFilter] = useState("All Specialties");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const setCurrentPage = (page) => {
        setSearchParams((prev) => {
            prev.set("page", page);
            return prev;
        });
    };
    const itemsPerPage = 8;

    // Data State
    const [testimonials, setTestimonials] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

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
        });
        return JSON.stringify(clone);
    };

    // Debounced search
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchTestimonials = async () => {
        const search = debouncedSearchTerm.trim();
        if (search.length > 0 && search.length < 3) {
            return;
        }

        setIsLoading(true);
        try {
            const params = { page: currentPage, limit: itemsPerPage, sort: 'recent' };
            if (statusFilter !== "All Status") {
                params.status = statusFilter.toLowerCase();
            }
            if (specialtyFilter !== "All Specialties") {
                params.specialty = specialtyFilter;
            }

            if (search.length >= 3) {
                result = await searchTestimonials(search, params);
            } else if (specialtyFilter !== "All Specialties") {
                result = await filterTestimonialsBySpecialty(specialtyFilter, params);
            } else if (statusFilter !== "All Status") {
                result = await filterTestimonialsByStatus(statusFilter, params);
            } else {
                result = await getAllTestimonials(params);
            }

            if (result && result.status === "success" && Array.isArray(result.data)) {
                const testimonialItems = result.data;
                const isClientSideSliced = testimonialItems.length > itemsPerPage;
                const total = isClientSideSliced
                    ? testimonialItems.length
                    : (Number.isFinite(result.total) ? result.total : testimonialItems.length);

                setTotalItems(total);

                if (isClientSideSliced) {
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    setTestimonials(testimonialItems.slice(startIndex, startIndex + itemsPerPage));
                } else {
                    setTestimonials(testimonialItems);
                }

                setTotalPages(Math.ceil(total / itemsPerPage) || 1);
            }
        } catch (error) {
            console.error("Failed to fetch testimonials:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, [currentPage, debouncedSearchTerm, specialtyFilter, statusFilter]);

    useEffect(() => {
        const fetchSpecialties = async () => {
            const result = await getSpecialties();
            if (result.status === "success") {
                setSpecialties(result.data);
            }
        }; fetchSpecialties();
    }, []);

    useEffect(() => {
        const fetchStatuses = async () => {
            const result = await getStatuses();
            if (result.status === "success") {
                setStatuses(result.data);
            }
        }; fetchStatuses();
    }, []);
    // const specialties = useMemo(() => ["All Specialties", ...new Set(testimonials.map(s => s.specality || s.specialty || s.testimony).filter(Boolean))], [testimonials]);
    // const statuses = useMemo(() => ["All Status", ...new Set(testimonials.map(s => s.status))], [testimonials]);

    // Server-side pagination: testimonials already contains only the current page items
    // const filteredTestimonials = testimonials.filter(item => {
    //     const itemSpecialty = item.specality || item.specialty || item.testimony;
    //     const specialtyMatch = specialtyFilter === "All Specialties" || itemSpecialty === specialtyFilter;
    //     const statusMatch = statusFilter === "All Status" || item.status === statusFilter;
    //     return specialtyMatch && statusMatch;
    // });
    // const currentData = filteredTestimonials;
    const currentData = testimonials.filter(item => {
        const itemSpecialty = item.specality || item.specialty || item.speciality || item.testimony;
        const specialtyMatch = specialtyFilter === "All Specialties" || itemSpecialty === specialtyFilter;
        const statusMatch = statusFilter === "All Status" || (item.status || "").toLowerCase() === statusFilter.toLowerCase();
        return specialtyMatch && statusMatch;
    });

    const handleExportCSV = () => {
        exportToCSV(testimonials, "Testimonials", {
            name: "Name",
            specality: "Speciality",
            testimony: "Testimony",
            rate: "Rating",
            status: "Status"
        });
    };

    // Modal Handlers
    const handleAddNew = () => {
        setFormType('add');
        setFormData({
            name: '',
            testimony: '',
            specality: '',
            review: '',
            status: 'Active',
            rate: null,
            file: null
        });
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        const editData = {
            ...item,
            rate: item?.rate ?? item?.rating ?? null,
        };
        setFormData(editData);
        initialFormDataRef.current = getComparableData(editData);
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleFormChange = (updatedData) => {
        setFormData(updatedData);
        // Clear error for any field that now has a value
        const newErrors = { ...errors };
        let errorsChanged = false;

        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] && newErrors[key]) {
                delete newErrors[key];
                errorsChanged = true;
            }
            // Special case for testimony/review which are interchangeable
            if ((key === 'testimony' || key === 'review') && updatedData[key]) {
                delete newErrors.testimony;
                delete newErrors.review;
                errorsChanged = true;
            }
            // Special case for file/image
            if ((key === 'file' || key === 'image') && updatedData[key]) {
                delete newErrors.file;
                delete newErrors.image;
                errorsChanged = true;
            }
        });

        if (errorsChanged) {
            setErrors(newErrors);
        }
    };

    const handleFormSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        const testimonyValue = formData.testimony || formData.review || '';
        const imageValue = formData.file || formData.image;
        const validationErrors = {};

        if (!imageValue) validationErrors.image = 'Testimonial image is required.';
        if (!formData.name?.trim()) validationErrors.name = 'Name is required.';
        if (!(formData.specality || formData.specialty || formData.speciality)?.trim()) {
            validationErrors.specality = 'Speciality is required.';
        }
        if (!testimonyValue.trim()) validationErrors.testimony = 'Testimony is required.';
        if (!formData.date) validationErrors.date = 'Date is required.';
        if (formData.rate === null || formData.rate === undefined || formData.rate === '' || Number(formData.rate) <= 0) {
            validationErrors.rate = 'Rating is required.';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);
        try {
            const data = new FormData();

            // Only send fields the backend accepts: name, testimony, rate, status, image
            // Backend does NOT accept: speciality, date, review, file, _id, etc.
            if (formData.name) data.append('name', formData.name);

            // testimony and review are aliases — backend field is 'testimony'
            if (testimonyValue) data.append('testimony', testimonyValue);

            if (formData.rate !== null && formData.rate !== undefined) data.append('rate', formData.rate);
            if (formData.status) data.append('status', formData.status);

            // Add speciality and date if present
            if (formData.speciality || formData.specialty || formData.specality) data.append('specality', formData.speciality || formData.specialty || formData.specality);
            if (formData.date) data.append('date', formData.date);

            // Image: form uses 'file' key, backend expects 'image'
            if (formData.file instanceof File) {
                data.append('image', formData.file);
            } else if (formData.image instanceof File) {
                data.append('image', formData.image);
            }

            // Note: speciality and date are in the UI but potentially not in backend schema.
            // Logging them here for diagnostics.
            const payload = {};
            for (let [key, value] of data.entries()) {
                payload[key] = value instanceof File ? `File: ${value.name}` : value;
            }

            if (formType === 'add') {
                const res = await createTestimonial(data);
                const msg = res?.message || res?.data?.message;
                if (msg) toast.success(msg);
            } else {
                const res = await updateTestimonial(selectedItem._id || selectedItem.id, data);
                const msg = res?.message || res?.data?.message;
                if (msg) toast.success(msg);
            }
            await fetchTestimonials();
            setIsFormModalOpen(false);
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
            const res = await deleteTestimonial(selectedItem._id || selectedItem.id);
            const msg = res?.message || res?.data?.message;
            if (msg) toast.success(msg);
            await fetchTestimonials();
            setIsDeleteModalOpen(false);
        } catch (error) {
        } finally {
            setIsDeleting(false);
        }
    };

    // Columns: Image, name , review, upload date, specialty, status, action
    const columns = [
        {
            key: "image",
            label: "Image",
            render: (value, row) => (
                <div className="flex-shrink-0 h-14 w-14 rounded overflow-hidden bg-gray-100">
                    <img
                        src={value || "/upload-placeholder.png"}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            e.target.src = "/upload-placeholder.png";
                        }}
                    />
                </div>
            ),
        },
        {
            key: "name",
            label: "Name",
            render: (value) => <div className="font-medium text-gray-900">{value}</div>,
        },
        {
            key: "rate",
            label: "Review",
            render: (value, row) => {
                const reviewText = value || row.rate;
                return <div className="text-sm text-gray-500 truncate max-w-xs" title={reviewText}>{reviewText || "—"}</div>;
            },
        },
        {
            key: "createdDate",
            label: "Date",
            render: (value, row) => <div className="text-sm text-gray-500">{value || row.cratedDate || "—"}</div>,
        },
        {
            key: "specialty",
            label: "Role/Specialty",
            className: "max-w-[200px] truncate",
            render: (value, row) => {
                const role = value || row.specality || row.specialty || row.speciality || row.testimony;
                return (
                    <div className="text-sm text-gray-700 truncate" title={role || ""}>
                        {role || "—"}
                    </div>
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
                        Testimonial Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-2">
                        Manage client reviews and feedback
                    </p>
                </div>
                {/* Desktop Add Button */}
                <div className="hidden md:flex justify-end mt-2">
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-[#00A3E0] hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer"
                    >
                        <FiPlus size={18} />
                        Add Testimonial
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
                        placeholder="Search testimonials..."
                    />
                </div>
                {specialties.length > 1 && (
                    <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-40">
                        {/* <DynamicDropdown
                            options={specialties.filter((s) => s !== "All Specialties")}
                            value={specialtyFilter}
                            onChange={(val) => {
                                setSpecialtyFilter(val);
                                setCurrentPage(1);
                            }}
                            defaultOption="All Specialties"
                        /> */}
                        <DynamicDropdown
                            options={specialties}
                            value={specialtyFilter}
                            defaultOption="All Specialties"
                            onChange={(val) => {
                                setSpecialtyFilter(val);
                                setCurrentPage(1);
                            }} />
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
                <div className="col-span-1 sm:w-auto flex justify-start md:hidden">
                    <DynamicButton
                        icon={FiPlus}
                        onClick={handleAddNew}
                        className="w-auto md:w-52 md:h-11 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                    >
                        <span className="hidden sm:inline">Add Testimonial</span>
                        <span className="sm:hidden">Add</span>
                    </DynamicButton>
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
                    of <span className="font-medium text-gray-900">{totalItems}</span> testimonials
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
                title={formType === 'add' ? 'Add New Testimonial' : 'Edit Testimonial'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Add Testimonial' : 'Update Testimonial'}
                size="lg"
                errors={errors}
                formType={formType}
                isChanged={formType === 'add' || getComparableData(formData) !== initialFormDataRef.current}
            >
                <TestimonialForm
                    formData={formData}
                    onChange={handleFormChange}
                    errors={errors}
                />
            </FormModal>

            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                entityName="Testimonial"
                itemName={selectedItem?.name}
                image={selectedItem?.image}
                isDeleting={isDeleting}
            />
        </div>

    );
}

export default TestimonialList;
