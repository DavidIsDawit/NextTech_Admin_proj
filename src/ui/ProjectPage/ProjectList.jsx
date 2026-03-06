import { useState, useMemo } from "react";
import { FiPlus, FiEye, FiTrash2 } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import DynamicTable from "../DynamicTable";
import DynamicDropdown from "../DynamicDropdown";
import DynamicButton from "../DynamicButton";
import DynamicSearch from "../DynamicSearch";
import Pagination from "../Pagination";
import Badge from "../Badge";
import { ProjectsData } from "../../data/ProjectsData";
import { exportToCSV } from "../../utils/csvExport";
import { FormModal } from "../modals/FormModal";
import { DeleteModal } from "../modals/DeleteModal";
import { ProjectForm } from "../forms/ProjectForm";
import { toast } from "sonner";

function ProjectList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sectorFilter, setSectorFilter] = useState("All Sectors");
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

    const sectors = useMemo(() => ["All Sectors", ...new Set(ProjectsData.map(s => s.sector))], []);
    const statuses = useMemo(() => ["All Status", ...new Set(ProjectsData.map(s => s.status))], []);

    const filteredData = useMemo(() => {
        return ProjectsData.filter((item) => {
            const matchesSearch = item.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSector = sectorFilter === "All Sectors" || item.sector === sectorFilter;
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesSector && matchesStatus;
        });
    }, [searchTerm, sectorFilter, statusFilter]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExportCSV = () => {
        exportToCSV(filteredData, "Projects", {
            projectName: "Project Name",
            client: "Client",
            sector: "Sector",
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
            console.log(`Project ${formType === 'add' ? 'added' : 'updated'}:`, formData);
            toast.success(`Project ${formType === 'add' ? 'added' : 'updated'} successfully!`);
            setIsSubmitting(false);
            setIsFormModalOpen(false);
        }, 1000);
    };

    const handleDeleteConfirm = () => {
        setIsDeleting(true);
        // Simulate API call
        setTimeout(() => {
            console.log("Project deleted:", selectedItem.id);
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }, 1000);
    };

    // Columns: Image, project name , client, sector,status, action
    const columns = [
        {
            key: "thumbnail",
            label: "Image",
            render: (value, row) => (
                <div className="flex-shrink-0 h-14 w-14">
                    <img
                        src={value}
                        alt={row.projectName}
                        className="h-full w-full rounded object-cover"
                    />
                </div>
            ),
        },
        {
            key: "projectName",
            label: "Project Name",
            render: (value) => <div className="font-medium text-gray-900">{value}</div>,
        },
        {
            key: "client",
            label: "Client",
            render: (value) => <div className="text-sm text-gray-500">{value}</div>,
        },
        {
            key: "sector",
            label: "Sector",
            render: (value) => <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-blue-50 text-blue-700">{value}</span>,
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
                    Project Management
                </h1>
                <p className="text-sm sm:text-base text-gray-500 mt-2">
                    Manage ongoing and completed projects
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
                        placeholder="Search projects..."
                    />
                </div>
                <div className="col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none sm:w-40">
                    <DynamicDropdown
                        options={sectors.filter((s) => s !== "All Sectors")}
                        value={sectorFilter}
                        onChange={(val) => {
                            setSectorFilter(val);
                            setCurrentPage(1);
                        }}
                        defaultOption="All Sectors"
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
                        <span className="hidden sm:inline">Add Project</span>
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
                    projects
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
                title={formType === 'add' ? 'Add New Project' : 'Edit Project'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Add Project' : 'Save Changes'}
                size="xl"
            >
                <ProjectForm
                    formData={formData}
                    onChange={setFormData}
                />
            </FormModal>

            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                entityName="Project"
                itemName={selectedItem?.name}
                image={selectedItem?.image}
                isDeleting={isDeleting}
            />
        </div>

    );
}

export default ProjectList;
