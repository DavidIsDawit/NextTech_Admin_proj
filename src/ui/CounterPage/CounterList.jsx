import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiEye, FiTrash2 } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import { toast } from "sonner";
import DynamicTable from "../DynamicTable";
import DynamicDropdown from "../DynamicDropdown";
import DynamicButton from "../DynamicButton";
import DynamicSearch from "../DynamicSearch";
import Pagination from "../Pagination";
import Badge from "../Badge";
import { getAllCounters, createCounter, updateCounter, deleteCounter } from "../../api/counterApi";
import { exportToCSV } from "../../utils/csvExport";
import { formatNumber } from "../../utils/formatters";
import { FormModal } from "../modals/FormModal";
import { CounterForm } from "../forms/CounterForm";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";

function CounterList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [counters, setCounters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCounters, setTotalCounters] = useState(0);

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formType, setFormType] = useState('add'); // 'add' or 'edit'
    const [errors, setErrors] = useState({});

    const fetchCounters = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                sort: "recent"
            };
            // Note: The backend getAllCounters takes query params for page and sort.
            // Search and status filtering might not be implemented on backend yet, 
            // but we'll apply them on the results for now if needed.
            const response = await getAllCounters(params);
            if (response.status === "success") {
                // Based on real Postman response: { data: { counters: [...] }, count: 4 }
                setCounters(response.data?.counters || response.certificates || response.counters || []);
                setTotalCounters(response.count || response.totalCounters || 0);
            }
        } catch (error) {
            toast.error("Failed to fetch counters");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCounters();
    }, [currentPage]);

    const statuses = useMemo(() => ["All Status", ...new Set(counters.map(s => s.status).filter(Boolean))], [counters]);

    const filteredData = useMemo(() => {
        return counters.filter((item) => {
            const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, counters]);

    const totalPages = Math.ceil(totalCounters / itemsPerPage) || 1;

    const handleExportCSV = () => {
        const dataToExport = filteredData.map(item => ({
            ...item,
            value: formatNumber(item.value)
        }));
        exportToCSV(dataToExport, "Counters", {
            value: "Number",
            name: "Counter Title",
            createdDate: "Date",
            status: "Status"
        });
    };

    // Modal Handlers
    const handleAddNew = () => {
        setFormType('add');
        setFormData({
            name: '',      // Initialize explicitly
            value: 0,
            status: 'active'
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

    const handleFormSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setErrors({});

        // Simple client-side validation
        const localErrors = {};
        if (formType === 'add' && !formData.name) {
            localErrors.name = "Counter Title is required";
        }

        if (Object.keys(localErrors).length > 0) {
            setErrors(localErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            // Strictly control the payload fields to align with backend expectations
            const payload = {
                value: Number(formData.value || formData.number || 0),
                status: formData.status
            };

            let response;
            if (formType === 'add') {
                // Name is only required/allowed during creation
                payload.name = formData.name || formData.title;
                response = await createCounter(payload);
            } else {
                const id = selectedItem._id || selectedItem.id;
                response = await updateCounter(id, payload);
            }

            if (response.status === "success") {
                toast.success(`Counter ${formType === 'add' ? 'added' : 'updated'} successfully!`);
                setIsFormModalOpen(false);
                fetchCounters();
            }
        } catch (error) {
            console.error("Counter submission error:", error);
            const responseData = error?.response?.data;
            console.log("Raw backend error data:", responseData);

            const backendErrors = mapBackendErrors(error);
            console.log("Mapped field errors:", backendErrors);

            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            } else {
                const msg = extractErrorMessage(error, "Failed to save counter");
                toast.error(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    // Extract names of counters already in use to prevent duplicates in the form
    const existingNames = useMemo(() => counters.map(c => c.name), [counters]);

    // Columns: Number , counter Title , date, status , action
    const columns = [
        {
            key: "value",
            label: "Number",
            render: (value) => <span className="font-bold text-gray-900">{formatNumber(value)}</span>,
        },
        {
            key: "name",
            label: "Counter Title",
            render: (value) => <div className="text-sm font-medium text-gray-900">{value}</div>,
        },
        {
            key: "createdDate",
            label: "Date",
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
                        onClick={() => console.log("View", row._id || row.id)}
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
                </div>
            ),
        },
    ];

    return (
        <div className="p-0 md:px-5 lg:px-2 2xl:px-5 space-y-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 sm:mb-6 pt-2 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        Counter Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-2">
                        Manage stats and counters
                    </p>
                </div>
                {/* Desktop Add Button */}
                <div className="hidden md:flex justify-end mt-2">
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-[#00A3E0] hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer"
                    >
                        <FiPlus size={18} />
                        Add Counter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-row flex-wrap items-center sm:justify-between gap-3 sm:gap-4 pb-6">
                <div className="order-1 sm:order-1 col-span-1 sm:w-auto flex-1 md:max-w-md">
                    <DynamicSearch
                        value={searchTerm}
                        onChange={(val) => {
                            setSearchTerm(val);
                            setCurrentPage(1);
                        }}
                        placeholder="Search counters..."
                    />
                </div>
                <div className="order-2 sm:order-4 col-span-1 sm:w-auto flex justify-end sm:ml-auto md:ml-0 flex-col sm:flex-row items-end sm:items-center">
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
                {statuses.length > 1 && (
                    <div className="order-3 sm:order-2 col-span-1 sm:w-36 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none">
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
                <div className="order-4 sm:order-3 col-span-1 sm:w-auto flex justify-end md:hidden">
                    <DynamicButton
                        icon={FiPlus}
                        onClick={handleAddNew}
                        className="w-auto md:w-48 md:h-11 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                    >
                        <span className="hidden sm:inline">Add Counter</span>
                        <span className="sm:hidden">Add</span>
                    </DynamicButton>
                </div>
            </div>

            <div>
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00A3E0]"></div>
                    </div>
                ) : (
                    <DynamicTable columns={columns} rows={filteredData} />
                )}
            </div>

            <div className="flex flex-col bg-white py-3 rounded-b-lg shadow   sm:flex-row justify-between items-center md:px-8 gap-4 pt-2">
                <div className="text-sm text-gray-500 order-2 sm:order-1">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {totalCounters > 0
                            ? (currentPage - 1) * itemsPerPage + 1
                            : 0}
                    </span>
                    -
                    <span className="font-medium text-gray-900">
                        {Math.min(currentPage * itemsPerPage, totalCounters)}
                    </span>{" "}
                    of <span className="font-medium text-gray-900">{totalCounters}</span>{" "}
                    counters
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
                title={formType === 'add' ? 'Add New Counter' : 'Edit Counter'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Add' : 'Save Changes'}
                size="md"
                errors={errors}
            >
                <CounterForm
                    formData={formData}
                    setFormData={setFormData}
                    existingNames={existingNames}
                    formType={formType}
                    errors={errors}
                />
            </FormModal>

        </div>

    );
}

export default CounterList;
