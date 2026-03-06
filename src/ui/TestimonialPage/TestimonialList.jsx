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
import { TestimonialForm } from "../forms/TestimonialForm";
import { getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from "../../api/api_testimonial";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";
import { toast } from "sonner";

function TestimonialList() {
    const [testimonials, setTestimonials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [specialtyFilter, setSpecialtyFilter] = useState("All Specialties");
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
    const [errors, setErrors] = useState({});
    const [totalTestimonials, setTotalTestimonials] = useState(0);

    const fetchTestimonials = async () => {
        setIsLoading(true);
        try {
            // Fetch a larger batch to handle client-side filtering/pagination like NewsList
            const result = await getAllTestimonials({ limit: 100, sort: 'recent' });

            if (result.status === "success") {
                const data = result.data?.testimonials || (Array.isArray(result.data) ? result.data : []);
                setTestimonials(data);
                setTotalTestimonials(result.totalCount || result.total || data.length || 0);
            }
        } catch (error) {
            console.error("Failed to fetch testimonials:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const specialties = useMemo(() => ["All Specialties", ...new Set(testimonials.map(s => s.specialty || s.speciality || s.testimony))], [testimonials]);
    const statuses = useMemo(() => ["All Status", ...new Set(testimonials.map(s => s.status))], [testimonials]);

    const filteredData = useMemo(() => {
        return testimonials.filter((item) => {
            const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const role = item.specialty || item.speciality || item.testimony;
            const matchesSpecialty = specialtyFilter === "All Specialties" || role === specialtyFilter;
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesSpecialty && matchesStatus;
        });
    }, [searchTerm, specialtyFilter, statusFilter, testimonials]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExportCSV = () => {
        exportToCSV(filteredData, "Testimonials", {
            name: "Name",
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
            speciality: '',
            review: '',
            date: '',
            status: 'active',
            rate: 5,
            file: null
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

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name?.trim()) newErrors.name = "Name is required";

        const testimonyValue = formData.testimony || formData.review || formData.message;
        if (!testimonyValue?.trim()) {
            newErrors.testimony = "Testimony is required";
        }

        if (!formData.speciality?.trim() && !formData.specialty?.trim()) {
            newErrors.speciality = "Speciality is required";
        }

        if (!formData.date) {
            newErrors.date = "Date is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

        // Client-side validation
        if (!validateForm()) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();

            // Only send fields the backend accepts: name, testimony, rate, status, image
            // Backend does NOT accept: speciality, date, review, file, _id, etc.
            if (formData.name) data.append('name', formData.name);

            // testimony and review are aliases — backend field is 'testimony'
            const testimonyValue = formData.testimony || formData.review || '';
            if (testimonyValue) data.append('testimony', testimonyValue);

            if (formData.rate !== null && formData.rate !== undefined) data.append('rate', formData.rate);
            if (formData.status) data.append('status', formData.status);

            // Image: form uses 'file' key, backend expects 'image'
            if (formData.file instanceof File) {
                data.append('image', formData.file);
            } else if (formData.image instanceof File) {
                data.append('image', formData.image);
            }

            // Note: speciality and date are in the UI but potentially not in backend schema.
            // Logging them here for diagnostics.
            console.log('Submitting testimonial...', { formType, name: formData.name });
            const payload = {};
            for (let [key, value] of data.entries()) {
                payload[key] = value instanceof File ? `File: ${value.name}` : value;
            }
            console.log("Testimonial Payload:", payload);

            if (formType === 'add') {
                await createTestimonial(data);
                toast.success("Testimonial added successfully!");
            } else {
                await updateTestimonial(selectedItem._id || selectedItem.id, data);
                toast.success("Testimonial updated successfully!");
            }
            await fetchTestimonials();
            setIsFormModalOpen(false);
        } catch (error) {
            console.error("Testimonial submission error:", error);
            const responseData = error?.response?.data;
            console.log("Raw backend error data:", responseData);
            console.group("Full Axios Error Details");
            console.log("Status:", error?.response?.status);
            console.log("Data:", responseData);
            console.log("Headers:", error?.response?.headers);
            console.groupEnd();

            const backendErrors = mapBackendErrors(error);
            console.log("Mapped field errors:", backendErrors);

            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            }
            toast.error(extractErrorMessage(error, "Failed to save testimonial"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deleteTestimonial(selectedItem._id || selectedItem.id);
            await fetchTestimonials();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete testimonial:", error);
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
                        alt={row.name || "Testimonial"}
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
                const role = value || row.speciality || row.testimony;
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
            <div className="mb-4 sm:mb-6 pt-2">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                    Testimonial Management
                </h1>
                <p className="text-sm sm:text-base text-gray-500 mt-2">
                    Manage client reviews and feedback
                </p>
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
                <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-40">
                    <DynamicDropdown
                        options={specialties.filter((s) => s !== "All Specialties")}
                        value={specialtyFilter}
                        onChange={(val) => {
                            setSpecialtyFilter(val);
                            setCurrentPage(1);
                        }}
                        defaultOption="All Specialties"
                    />
                </div>
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
                <div className="col-span-1 sm:w-auto flex justify-start">
                    <DynamicButton
                        icon={FiPlus}
                        onClick={handleAddNew}
                        className="w-auto md:w-52 md:h-11 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                    >
                        <span className="hidden sm:inline">Add Testimonial</span>
                        <span className="sm:hidden">Add</span>
                    </DynamicButton>
                </div>
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
                    testimonials
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
                submitLabel={formType === 'add' ? 'Add Testimonial' : 'Save Changes'}
                size="lg"
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
