import { useState, useMemo ,useEffect} from "react";
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
import  getAllTestimonials from "../../api/api_testimonial";
import {BASE_URL} from "../../api/api";

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
    const [totalTestimonials, setTotalTestimonials] = useState(0);

        const fetchTestimonials = async () => {
            setIsLoading(true);
            console.log("[FETCH START] Current page:", currentPage);
            try {
                // Backend handles pagination
                const params = {
                    page: currentPage,
                    sort: 'recent' // Default according to Postman docs
                };
                console.log("[FETCH] Sending params to API:", params);                
                    
                const data = await getAllTestimonials(params);
                console.log("[FETCH] data:", data); 
                
                if (data.status === "success") {
                    console.log("[FETCH] Status",data)
                    setTestimonials(data.data );
                    setTotalTestimonials(data.data?.totalCount || 0);
                }
            } catch (error) {
                // Error handled globally in api.js

                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };
    
        useEffect(() => {
            fetchTestimonials();
        }, [currentPage]);

   

    const specialties = useMemo(() => ["All Specialties", ...new Set(testimonials.map(s => s.specialty))], []);
    const statuses = useMemo(() => ["All Status", ...new Set(testimonials.map(s => s.status))], []);

    const filteredData = useMemo(() => {
        return testimonials.filter((item) => {
            const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSpecialty = specialtyFilter === "All Specialties" || item.specialty === specialtyFilter;
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesSpecialty && matchesStatus;
        });
    }, [searchTerm, specialtyFilter, statusFilter]);

    // const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    // const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
     const totalPages = Math.ceil(totalTestimonials / itemsPerPage);
    const currentData = testimonials;

    const handleExportCSV = () => {
        exportToCSV(filteredData, "Testimonials", {
            name: "Name",
            review: "Review",
            date: "Date",
            specialty: "Role/Specialty",
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
            console.log(`Testimonial ${formType === 'add' ? 'added' : 'updated'}:`, formData);
            setIsSubmitting(false);
            setIsFormModalOpen(false);
        }, 1000);
    };

    const handleDeleteConfirm = () => {
        setIsDeleting(true);
        // Simulate API call
        setTimeout(() => {
            console.log("Testimonial deleted:", selectedItem.id);
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }, 1000);
    };

    // Columns: Image, name , review, upload date, specialty, status, action
    const columns = [
    {
  key: "image",
  label: "Image",
  render: (value, row) => {
    
    console.log("[TABLE IMAGE] Raw 'image' value:", value);
    const finalSrc = `${BASE_URL}${value}`;

    console.log("[TABLE IMAGE] Cleaned path:", value);
    console.log("[TABLE IMAGE] Final src:", finalSrc);

    return (
      <div className="flex-shrink-0 h-14 w-14 rounded overflow-hidden bg-gray-100">
        <img
          src={finalSrc}
          alt={row.name || "Testimonial"}
          className="h-full w-full object-cover"
          onError={(e) => {
            console.e
            console.error("[TABLE IMAGE ERROR] Failed to load:", finalSrc);
          
          }}
        />
      </div>
    );
  },
},
        {
            key: "name",
            label: "Name",
            render: (value) => <div className="font-medium text-gray-900">{value}</div>,
        },
        {
            key: "rate",
            label: "Review",
            render: (value) => <div className="text-sm text-gray-500 truncate max-w-xs" title={value}>{value}</div>,
        },
        {
            key: "cratedDate",
            label: "Date",
            render: (value) => <div className="text-sm text-gray-500">{value}</div>,
        },
        {
            key: "testimony",
            label: "Role/Specialty",
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
                        Testimonial Management
                    </h1>
                    <p className="text-base text-gray-500 mt-3">
                        Manage client reviews and feedback
                    </p>
                </div>
                <DynamicButton
                    icon={FiPlus}
                    onClick={handleAddNew}
                    className="w-full sm:w-auto md:w-52 lg:w-44 xl:w-52 md:h-12 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                >
                    Add New Testimonial
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
                            placeholder="Search testimonials..."
                        />
                    </div>
                    <div className="w-full sm:w-40">
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
                    onChange={setFormData}
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
