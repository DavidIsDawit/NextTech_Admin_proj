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

    const statuses = ["All Status", "active", "inactive", "draft"];

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
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        setFormData({ ...item });
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async () => {
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
            const msg = error.response?.data?.message || "Failed to save counter";
            toast.error(msg);
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl lg:text-3xl 2xl:text-4xl font-bold text-gray-900">
                        Counter Management
                    </h1>
                    <p className="text-base text-gray-500 mt-3">
                        Manage stats and counters
                    </p>
                </div>
                <DynamicButton
                    icon={FiPlus}
                    onClick={handleAddNew}
                    className="w-full sm:w-auto md:w-52 lg:w-44 xl:w-52 md:h-12 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                >
                    Add New Counter
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
                            placeholder="Search counters..."
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
                submitLabel={formType === 'add' ? 'Add Counter' : 'Save Changes'}
                size="lg"
            >
                <CounterForm
                    formData={formData}
                    setFormData={setFormData}
                    existingNames={existingNames}
                    formType={formType}
                />
            </FormModal>

        </div>

    );
}

export default CounterList;
