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
import { TeamForm } from "../forms/TeamForm";
import { getAllTeams, createTeamMember, updateTeamMember, deleteTeamMember } from "../../api/teamApi";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";
import { toast } from "sonner";

function TeamList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [specialtyFilter, setSpecialtyFilter] = useState("All Specialties");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Data State
    const [team, setTeam] = useState([]);
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

    const fetchTeam = async () => {
        setIsLoading(true);
        try {
            const result = await getAllTeams({ page: currentPage, limit: 100 });
            if (result.status === "success") {
                setTeam(result.data || []);
                setTotalItems(result.totalTeams || result.data?.length || 0);
            }
        } catch (error) {
            console.error("Failed to fetch team:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const specialties = useMemo(() => ["All Specialties", ...new Set(team.map(s => s.specialty).filter(Boolean))], [team]);
    const statuses = useMemo(() => ["All Status", ...new Set(team.map(s => s.status).filter(Boolean))], [team]);

    const filteredData = useMemo(() => {
        return team.filter((item) => {
            const matchesSearch = searchTerm.length < 3 || item.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSpecialty = specialtyFilter === "All Specialties" || item.specialty === specialtyFilter;
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesSpecialty && matchesStatus;
        });
    }, [searchTerm, specialtyFilter, statusFilter, team]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExportCSV = () => {
        exportToCSV(filteredData, "Team", {
            name: "Name",
            date: "Joining Date",
            specialty: "Specialty",
            status: "Status"
        });
    };

    // Modal Handlers
    const handleAddNew = () => {
        setFormType('add');
        setFormData({
            name: '',
            specialty: '',
            status: 'active',
            image: null,
            socialMedia: []
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

        // Frontend Validation
        const newErrors = {};
        if (formType === 'add' && !formData.image) newErrors.image = "Team member image is required";
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.specialty) newErrors.specialty = "Specialty is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'socialMedia' && Array.isArray(formData[key])) {
                    data.append(key, JSON.stringify(formData[key]));
                } else if (key === 'image' && formData[key] instanceof File) {
                    data.append('image', formData[key]);
                } else if (key !== 'socialMedia' && key !== 'image' && formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });

            console.log('Submitting team member...', { formType, name: formData.name });

            if (formType === 'add') {
                await createTeamMember(data);
                toast.success("Team member added successfully!");
            } else {
                await updateTeamMember(selectedItem._id || selectedItem.id, data);
                toast.success("Team member updated successfully!");
            }
            await fetchTeam();
            setIsFormModalOpen(false);
        } catch (error) {
            console.error("Team member submission error:", error);
            const responseData = error?.response?.data;
            console.log("Raw backend error data:", responseData);

            const backendErrors = mapBackendErrors(error);
            console.log("Mapped field errors:", backendErrors);

            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            } else {
                toast.error(extractErrorMessage(error, "Failed to save team member"));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deleteTeamMember(selectedItem._id || selectedItem.id);
            await fetchTeam();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete team member:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Columns: Image , name , upload date , specialty, status, action
    const columns = [
        {
            key: "image",
            label: "Image",
            render: (value, row) => (
                <div className="flex-shrink-0 h-14 w-14">
                    <img
                        src={value}
                        alt={row.name}
                        className="h-full w-full rounded object-cover"
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
            key: "createdDate",
            label: "Joining Date",
            render: (value, row) => <div className="text-sm text-gray-500">{value?.split('T')[0] || row.date}</div>,
        },
        {
            key: "specialty",
            label: "Specialty",
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
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 sm:mb-6 pt-2 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        Team Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-2">
                        Manage team members and specialties
                    </p>
                </div>
                {/* Desktop Add Button */}
                <div className="hidden md:flex justify-end mt-2">
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-[#00A3E0] hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer"
                    >
                        <FiPlus size={18} />
                        Add New Team
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
                        placeholder="Search team..."
                    />
                </div>
                {specialties.length > 1 && (
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
                        <span className="hidden sm:inline">Add Team Member</span>
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
                        {filteredData.length > 0
                            ? (currentPage - 1) * itemsPerPage + 1
                            : 0}
                    </span>
                    -
                    <span className="font-medium text-gray-900">
                        {Math.min(currentPage * itemsPerPage, filteredData.length)}
                    </span>{" "}
                    of <span className="font-medium text-gray-900">{filteredData.length}</span>{" "}
                    members
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
                title={formType === 'add' ? 'Add Team Member' : 'Edit Team Member'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Add Member' : 'Save Changes'}
                size="md"
                errors={errors}
            >
                <TeamForm
                    formData={formData}
                    onChange={setFormData}
                    errors={errors}
                />
            </FormModal>

            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                entityName="Team Member"
                itemName={selectedItem?.name}
                image={selectedItem?.image}
                isDeleting={isDeleting}
            />
        </div>

    );
}

export default TeamList;
