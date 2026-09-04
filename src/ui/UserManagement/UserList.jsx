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
import { FormModal } from "../modals/FormModal";
import { DeleteModal } from "../modals/DeleteModal";
import { UserForm } from "../forms/UserForm";
import { getAllUsers, searchUsers, filterUsersByRole, createUser, updateUser, deleteUser, getRoles } from "../../api/userApi";
import api, { buildImageUrl } from "../../api/api";
import { toast } from "sonner";
import { extractErrorMessage, mapBackendErrors } from "../../utils/errorHelpers";

function UserList() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const roleParam = searchParams.get("role");
    const sortParam = searchParams.get("sort");

    const roleFilter = roleParam ? (roleParam.charAt(0).toUpperCase() + roleParam.slice(1).toLowerCase()) : "All";
    const sortOption = sortParam || "Recent (by date)";

    const itemsPerPage = 8;

    const setFiltersAndPage = ({ role, sort, page }) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            
            const newPage = page !== undefined ? page : 1;
            if (newPage > 1) {
                next.set("page", String(newPage));
            } else {
                next.delete("page");
            }

            const newRole = role !== undefined ? role : (searchParams.get("role") || "All");
            if (newRole && newRole !== "All") {
                next.set("role", newRole.toLowerCase());
            } else {
                next.delete("role");
            }

            const newSort = sort !== undefined ? sort : searchParams.get("sort");
            if (newSort && newSort !== "Recent (by date)") {
                next.set("sort", newSort);
            } else {
                next.delete("sort");
            }

            return next;
        }, { replace: true });
    };

    const setCurrentPage = (page) => {
        setFiltersAndPage({ page });
    };
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [availableRoles, setAvailableRoles] = useState(["Admin", "User"]);

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formType, setFormType] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({});
    const [selectedId, setSelectedId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [errors, setErrors] = useState({});
    const initialFormDataRef = useRef(null);
    // Stores the original item's employeId so we never generate a new one on edit
    const originalEmployeIdRef = useRef(null);

    // Debounced search
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchUsers = async () => {
        const search = debouncedSearchTerm.trim();
        if (search.length > 0 && search.length < 3) {
            return;
        }

        setIsLoading(true);
        try {
            let data;
            const params = { page: currentPage, limit: itemsPerPage, sort: 'recent' };

            if (search.length >= 3) {
                data = await searchUsers(search, params);
            } else if (roleFilter !== "All") {
                data = await filterUsersByRole(roleFilter.toLowerCase(), params);
            } else {
                data = await getAllUsers(params);
            }

            if (data && data.status === "success") {
                let fetchedUsers = data.users || data.data?.users || data.data || [];
                let total = data.totalUsers ?? data.total ?? fetchedUsers.length;

                // Handle simultaneous search and filter (search wins backend call, filter locally)
                if (search.length >= 3 && roleFilter !== "All") {
                    fetchedUsers = fetchedUsers.filter(u => (u.role || "").toLowerCase() === roleFilter.toLowerCase());
                    total = fetchedUsers.length;
                }

                const isClientSideSliced = fetchedUsers.length > itemsPerPage;
                const finalTotal = isClientSideSliced ? fetchedUsers.length : total;

                setTotalItems(finalTotal);

                if (isClientSideSliced) {
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    setUsers(fetchedUsers.slice(startIndex, startIndex + itemsPerPage));
                } else {
                    setUsers(fetchedUsers);
                }

                setTotalPages(Math.ceil(finalTotal / itemsPerPage) || 1);
            } else {
                setUsers([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setUsers([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, debouncedSearchTerm, roleFilter]);

    /**
     * Produces a normalized snapshot string for dirty-check comparison.
     * Rules:
     *  - name  : trimmed
     *  - email : trimmed + lowercased (email is case-insensitive)
     *  - role  : lowercased (backend canonical form)
     *  - password: empty string means "unchanged" — only a non-empty value counts
     */
    const getNormalizedSnapshot = (data) => {
        if (!data) return '';
        const { name = '', role = '', email = '', password = '', employeId = '' } = data;
        return JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            role: role.trim().toLowerCase(),
            employeId: employeId.trim(),
            // Treat any blank/whitespace password as "not changed"
            password: password.trim(),
        });
    };

    // Client-side sorting (Filtering & Search now done on backend)
    const processedUsers = useMemo(() => {
        let result = [...users];

        // Sorting
        result.sort((a, b) => {
            const nameA = (a.name || a.fullName || "").toLowerCase();
            const nameB = (b.name || b.fullName || "").toLowerCase();
            const dateA = new Date(a.createdDate || 0).getTime();
            const dateB = new Date(b.createdDate || 0).getTime();

            switch (sortOption) {
                case "Ascending(by name)":
                    return nameA.localeCompare(nameB);
                case "Descending(by name)":
                    return nameB.localeCompare(nameA);
                case "Old (by date)":
                    return dateA - dateB;
                case "Recent (by date)":
                default:
                    return dateB - dateA;
            }
        });

        return result;
    }, [users, sortOption]);

    // Server-side pagination is handled by fetchUsers, so we just use the filtered results directly
    const currentData = processedUsers;

    // If page is out of bounds, reset to 1
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    // Modal Handlers
    const handleAddNew = () => {
        setFormType('add');
        setFormData({
            name: '',
            role: 'User',
            email: '',
            employeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
            password: '',
        });
        initialFormDataRef.current = null;
        originalEmployeIdRef.current = null;
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormType('edit');
        setSelectedItem(item);
        setSelectedId(item._id ?? item.id);

        const empId = item.employeId || item.employeeId || '';
        originalEmployeIdRef.current = empId;

        // Normalize backend role (lowercase → capitalized) to match the dropdown options
        const rawRole = item.role || '';
        const normalizedRole = rawRole
            ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase()
            : '';

        const editData = {
            name: item.name || item.fullName || '',
            role: normalizedRole,
            email: item.email || '',
            employeId: empId,
            password: '', // always blank when opening edit
        };
        // Capture the snapshot synchronously BEFORE setting state — same pattern as TestimonialList
        initialFormDataRef.current = getNormalizedSnapshot(editData);
        setFormData(editData);
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

        // Frontend validation removed; relying on backend for mandatory fields and errors.

        // ── Guard: block edit submission when nothing actually changed ────────────
        // This is the second line of defence — the button is already disabled, but
        // if somehow the form is submitted (e.g. keyboard Enter), we stop here too.
        if (formType === 'edit') {
            const hasChanged = getNormalizedSnapshot(formData) !== initialFormDataRef.current;
            if (!hasChanged) {
                toast.info("No changes detected.");
                return;
            }
        }

        setIsSubmitting(true);

        try {
            if (formType === 'add') {
                // ── Create payload ───────────────────────────────────────────────
                // Include all fields the backend requires for creation.
                const createPayload = {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    role: formData.role.toLowerCase(),
                    password: formData.password,
                    department: "N/A",
                    phoneNumber: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
                    location: "N/A",
                    employeId: formData.employeId ? formData.employeId.trim() : `EMP${Math.floor(1000 + Math.random() * 9000)}`,
                };
                const res = await createUser(createPayload);
                toast.success(res?.message || res?.data?.message);
            } else {
                // ── Update payload ───────────────────────────────────────────────
                // Send only the fields that are editable through this form.
                const updatePayload = {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    role: formData.role.toLowerCase(),
                    employeId: formData.employeId ? formData.employeId.trim() : (originalEmployeIdRef.current || undefined),
                };
                // Only include password if the admin entered a new one
                if (formData.password?.trim()) {
                    updatePayload.password = formData.password.trim();
                }
                const res = await updateUser(selectedId, updatePayload);
                toast.success(res?.message || res?.data?.message);
            }
            setIsFormModalOpen(false);
            fetchUsers();
        } catch (error) {
            const backendErrors = mapBackendErrors(error);
            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            } else {
                const msg = extractErrorMessage(error);
                if (msg) toast.error(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteUser(selectedItem._id || selectedItem.id);
            toast.success(res?.message || res?.data?.message);
            setIsDeleteModalOpen(false);
            fetchUsers();
        } catch (error) {
            // Error handled globally in api.js
        } finally {
            setIsDeleting(false);
        }
    };

    const getImageUrl = (value) => {
        if (!value) return "/upload-placeholder.png"; // or a user default avatar
        return buildImageUrl(value) || "/upload-placeholder.png";
    };

    const columns = [
        {
            key: "photo",
            label: "Image",
            render: (value, row) => {
                const imageUrl = getImageUrl(value || row.profilePicture || row.image);
                return (
                    <div className="flex-shrink-0 h-10 w-10">
                        <img
                            src={imageUrl}
                            alt=""
                            crossOrigin="anonymous"
                            className="h-full w-full rounded-full object-cover"
                            onError={(e) => {
                                e.target.src = "/upload-placeholder.png";
                            }}
                        />
                    </div>
                );
            },
        },
        {
            key: "name",
            label: "Name/ID",
            className: "max-w-[200px] truncate",
            render: (value, row) => {
                const name = value || row.fullName || "—";
                const id = row.employeId ? ` / ${row.employeId}` : "";
                return (
                    <div className="font-medium text-gray-900 truncate" title={name + id}>
                        {name}{id}
                    </div>
                );
            },
        },
        {
            key: "role",
            label: "Role",
            render: (value) => <div className="text-gray-600">{value || '—'}</div>,
        },
        {
            key: "email",
            label: "Email",
            render: (value) => <div className="text-gray-600">{value || '—'}</div>,
        },
        {
            key: "createdDate",
            label: "Date",
            render: (value, row) => {
                const date = value || row.createdDate;
                return <div className="text-sm text-gray-500">{date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</div>;
            },
        },
        {
            key: "actions",
            label: "Action",
            render: (_, row) => {
                return (
                    <div className="flex items-center space-x-3">
                        <button
                            className="p-1 text-gray-400 hover:text-gray-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                            onClick={() => handleEdit(row)}
                            title="Edit"
                        >
                            <BiEdit size={20} />
                        </button>
                        <button
                            className="p-1 text-red-300 hover:text-red-500 rounded border border-red-100 hover:bg-red-50 transition-colors"
                            onClick={() => handleDeleteClick(row)}
                            title="Delete"
                        >
                            <FiTrash2 size={20} />
                        </button>
                    </div>
                );
            },
        },
    ];

    const sortOptions = [
        "Ascending(by name)",
        "Descending(by name)",
        "Recent (by date)",
        "Old (by date)"
    ];

    return (
        <div className="p-0 md:px-5 lg:px-2 2xl:px-5 space-y-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 sm:mb-6 pt-2 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        User Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-2">
                        Manage system users and their roles
                    </p>
                </div>
                {/* Desktop Add Button */}
                <div className="hidden md:flex justify-end mt-2">
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-[#00A3E0] hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors cursor-pointer"
                    >
                        <FiPlus size={18} />
                        Add User
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
                        placeholder="Search users..."
                    />
                </div>

                <div className="order-2 sm:order-2 col-span-2 sm:col-span-1 flex flex-wrap items-center gap-2 text-sm font-medium mr-auto sm:mx-4">
                    {["All", ...availableRoles].map((role) => {
                        const isActive = (roleFilter || '').toLowerCase() === (role || '').toLowerCase();
                        return (
                            <button
                                key={role}
                                onClick={() => setFiltersAndPage({ role, page: 1 })}
                                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${
                                    isActive
                                        ? 'bg-[#00A3E0] text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-[#e0f2fe] hover:text-[#00A3E0]'
                                }`}
                            >
                                {role}
                            </button>
                        );
                    })}
                </div>

                <div className="order-3 sm:order-3 col-span-1 border-gray-100 sm:border-0 rounded-lg sm:rounded-none bg-white sm:bg-transparent overflow-hidden shadow-sm sm:shadow-none sm:w-40">
                    <DynamicDropdown
                        options={sortOptions}
                        value={sortOption}
                        onChange={(val) => setFiltersAndPage({ sort: val, page: 1 })}
                        defaultOption="Sort By"
                    />
                </div>

                <div className="order-4 sm:order-4 col-span-1 sm:w-auto flex justify-end md:hidden">
                    <DynamicButton
                        icon={FiPlus}
                        onClick={handleAddNew}
                        className="w-auto md:w-52 md:h-11 justify-center bg-[#00A3E0] hover:bg-blue-600 text-white"
                    >
                        <span className="hidden sm:inline">Add User</span>
                        <span className="sm:hidden">Add</span>
                    </DynamicButton>
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
                    of <span className="font-medium text-gray-900">{totalItems}</span> users
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
                title={formType === 'add' ? 'Add New User' : 'Edit User'}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel={formType === 'add' ? 'Add User' : 'Update User'}
                size="md"
                errors={errors}
                formType={formType}
                isChanged={formType === 'add' || getNormalizedSnapshot(formData) !== initialFormDataRef.current}
            >
                <UserForm
                    formData={formData}
                    onChange={setFormData}
                    errors={errors}
                    formType={formType}
                />
            </FormModal>

            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteConfirm}
                entityName="User"
                itemName={selectedItem?.name || selectedItem?.fullName}
                isDeleting={isDeleting} />
        </div>
    );
}

export default UserList;
