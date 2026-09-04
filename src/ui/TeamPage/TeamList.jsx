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
import { TeamForm } from "../forms/TeamForm";
import { getAllTeams, createTeamMember, updateTeamMember, deleteTeamMember, searchTeams, filterTeamsBySpecialty, getSpecialties, getStatuses, filterTeamsByStatus } from "../../api/teamApi";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";
import { toast } from "sonner";

function TeamList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [specialties, setSpecialties] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const statusParam = searchParams.get("status");
    const specialtyParam = searchParams.get("specialty") || searchParams.get("category");

    const statusFilter = statusParam
        ? (statusParam.toLowerCase() === "active" ? "Active" : statusParam.toLowerCase() === "inactive" ? "Inactive" : statusParam)
        : "All Status";
    const specialtyFilter = specialtyParam || "All Specialties";

    const itemsPerPage = 8;

    const setFiltersAndPage = ({ status, specialty, page }) => {
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

            const newSpecialty = specialty !== undefined ? specialty : (searchParams.get("specialty") || searchParams.get("category") || "All Specialties");
            if (newSpecialty && newSpecialty !== "All Specialties" && newSpecialty !== "All Categories") {
                next.set("specialty", newSpecialty);
            } else {
                next.delete("specialty");
            }

            return next;
        }, { replace: true });
    };

    const setCurrentPage = (page) => {
        setFiltersAndPage({ page });
    };

    // Data State
    const [team, setTeam] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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

    const fetchTeam = async () => {
        const search = debouncedSearchTerm.trim();
        if (search.length > 0 && search.length < 3) {
            return;
        }

        setIsLoading(true);
        try {
            let result;
            const params = { page: currentPage, limit: itemsPerPage };
            if (statusFilter !== "All Status") {
                params.status = statusFilter.toLowerCase();
            }
            if (specialtyFilter !== "All Specialties") {
                params.specialty = specialtyFilter;
            }

            if (search.length >= 3) {
                result = await searchTeams(search, params);
            } else if (specialtyFilter !== "All Specialties" && statusFilter !== "All Status") {
                result = await getAllTeams(params);
            } else if (specialtyFilter !== "All Specialties") {
                result = await filterTeamsBySpecialty(specialtyFilter, params);
            } else if (statusFilter !== "All Status") {
                result = await filterTeamsByStatus(statusFilter, params);
            } else {
                result = await getAllTeams(params);
            }

            if (result) {
                let teamItems = Array.isArray(result.data)
                    ? result.data
                    : (result.team || result.teams || result.teamMembers || (Array.isArray(result) ? result : []));

                if (statusFilter !== "All Status") {
                    const statusMatch = statusFilter.toLowerCase();
                    teamItems = teamItems.filter(item => (item.status || "").toLowerCase() === statusMatch);
                }
                if (specialtyFilter !== "All Specialties") {
                    const specMatch = specialtyFilter.toLowerCase();
                    teamItems = teamItems.filter(item => {
                        const sp = item.specality || item.specialty || "";
                        return sp.toLowerCase() === specMatch;
                    });
                }

                const isClientSideSliced = teamItems.length > itemsPerPage;
                const total = isClientSideSliced
                    ? teamItems.length
                    : (result.totalTeams ?? result.total ?? teamItems.length);

                setTotalItems(total);

                if (isClientSideSliced) {
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    setTeam(teamItems.slice(startIndex, startIndex + itemsPerPage));
                } else {
                    setTeam(teamItems);
                }

                setTotalPages(Math.ceil(total / itemsPerPage) || 1);
            }
        } catch (error) {
            console.error("Failed to fetch team members:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
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

    const currentData = useMemo(() => {
        return team.filter((item) => {
            const itemSpec = item.specality || item.specialty || "";
            const itemStatus = item.status || "";

            const specMatch = specialtyFilter === "All Specialties" || itemSpec.toLowerCase() === specialtyFilter.toLowerCase();
            const statusMatch = statusFilter === "All Status" || itemStatus.toLowerCase() === statusFilter.toLowerCase();

            return specMatch && statusMatch;
        });
    }, [team, specialtyFilter, statusFilter]);
    // const currentData = filteredTeams;

    // const handleExportCSV = () => {
    //     exportToCSV(team, "Team", {
    //         name: "Name",
    //         date: "Joining Date",
    //         specialty: "Specialty",
    //         status: "Status"
    //     });
    // };
    const handleExportCSV = () => {
        const exportData = team.map((member) => ({
            name: member.name,
            date: member.createdDate || member.date,
            specialty: member.specialty,
            status: member.status,
        }));

        exportToCSV(exportData, "Team", {
            name: "Name",
            date: "Joining Date",
            specialty: "Specialty",
            status: "Status",
        });
    };

    // Modal Handlers
    const handleAddNew = () => {
        setFormType('add');
        setFormData({
            name: '',
            specialty: '',
            status: 'Active',
            image: null,
            socialMedia: []
        });
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        const editData = { ...item };
        setFormData(editData);
        initialFormDataRef.current = getComparableData(editData);
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

        // Frontend validation removed; relying on backend.

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


            if (formType === 'add') {
                const res = await createTeamMember(data);
                const msg = res?.message || res?.data?.message;
                if (msg) toast.success(msg);
            } else {
                const res = await updateTeamMember(selectedItem._id || selectedItem.id, data);
                const msg = res?.message || res?.data?.message;
                if (msg) toast.success(msg);
            }
            await fetchTeam();
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
            const res = await deleteTeamMember(selectedItem._id || selectedItem.id);
            const msg = res?.message || res?.data?.message;
            if (msg) toast.success(msg);
            await fetchTeam();
            setIsDeleteModalOpen(false);
        } catch (error) {
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
                        alt=""
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
                <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-40">
                    <DynamicDropdown
                        options={specialties.length > 0 ? specialties : [...new Set(team.map(t => t.specality || t.specialty).filter(Boolean))]}
                        value={specialtyFilter}
                        defaultOption="All Specialties"
                        onChange={(val) => {
                            setFiltersAndPage({ specialty: val, page: 1 });
                        }}
                    />
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
                        <span className="hidden sm:inline">Add Team Member</span>
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
                    of <span className="font-medium text-gray-900">{totalItems}</span> members
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
                submitLabel={formType === 'add' ? 'Add Member' : 'Update Member'}
                size="md"
                errors={errors}
                formType={formType}
                isChanged={formType === 'add' || getComparableData(formData) !== initialFormDataRef.current}
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
