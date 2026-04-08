// src/pages/Admin/AdminDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    uploadStudentsCsv,
    getAllStudents,
    updateStudent,
    deleteStudent,
    addStudent,
    bulkDeleteStudents,
    exportStudentsCsv,
} from "../../api";
import {
    Upload,
    Users,
    AlertCircle,
    Edit,
    Trash2,
    X,
    Check,
    Loader2,
    Plus,
    FileText,
    UploadCloud,
    RefreshCw,
    Download,
    Search,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { useNavigate } from "react-router";
import styles from "./AdminDashboard.module.css";
import { useAlert } from "../../context/AlertContext";
import { Button } from "../../components/Buttons/Button";
import { FormRow, Input, Select } from "../../components/FormElements/FormElements";
import Modal from "../../components/Modal/Modal";
import { HOSTEL_OPTIONS } from "../Hostels";
import { Table } from "../../components/Table/Table";

const ErrorReport = ({ data }) => {
    return (
        <div className={styles.errorReportContainer}>
            <p>
                <strong>{data.message}</strong>
            </p>

            {/* General/Message Errors */}
            {data.errors.filter((e) => e.type === "message").length > 0 && (
                <div className={styles.errorSection}>
                    <h4 className={styles.errorHeading}>Errors</h4>
                    <ul className={styles.messageList}>
                        {data.errors
                            .filter((e) => e.type === "message")
                            .map((err, i) => (
                                <li key={i} className={styles.messageListItem}>
                                    <p>{i + 1}</p>
                                    {err.message}
                                </li>
                            ))}
                    </ul>
                </div>
            )}

            {/* Row Errors inside a table */}
            {data.errors.filter((e) => e.type === "row").length > 0 && (
                <div className={styles.errorSection}>
                    <h4 className={styles.errorHeading}>Invalid Row Data</h4>
                    <div className={styles.tableWrapper}>
                        <table className={styles.popupErrorTable}>
                            <thead>
                                <tr>
                                    <th>Reason</th>
                                    <th>Row Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.errors
                                    .filter((e) => e.type === "row")
                                    .map((err, i) => (
                                        <tr key={i}>
                                            <td className={styles.errorReasonCell}>{err.message}</td>
                                            <td className={styles.errorDataCell}>
                                                <pre className={styles.errorPre}>
                                                    {JSON.stringify(err.data, null, 2)}
                                                </pre>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminDashboard = () => {
    const { user, role, loading } = useAuth();
    const { showAlert, showConfirm } = useAlert();
    const navigate = useNavigate();

    // Active Tab (students/ upload)
    const [activeTab, setActiveTab] = useState("students");
    const [students, setStudents] = useState([]);
    const [totalStudents, setTotalStudents] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingStudent, setEditingStudent] = useState({
        roll_no: "",
        name: "",
        email: "",
        hostel_name: "",
        room_no: "",
        floor_no: "",
    });

    // CSV File Upload Logic
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState({ loading: false, message: "", errors: [] });

    // --- NEW: Add Student States ---
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newStudent, setNewStudent] = useState({
        roll_no: "",
        name: "",
        email: "",
        hostel_name: "",
        room_no: "",
        floor_no: "",
    });

    // --- NEW: Bulk Selection States ---
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // Loading States for Actions
    const [isUpdating, setIsUpdating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isFetchingStudents, setIsFetchingStudents] = useState(true);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(20);
    const [jumpPage, setJumpPage] = useState("");

    // --- NEW: Search & Sort States ---
    const [sortBy, setSortBy] = useState("room_no");
    const [sortOrder, setSortOrder] = useState("ASC");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    // --- UPDATED: Tab Change Handler (Reset limit to 20) ---
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === "students") {
            setLimit(20);
            setCurrentPage(1);
        }
    };

    // --- NEW: Handlers for Search, Sort, and Export ---
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
        } else {
            setSortBy(column);
            setSortOrder("ASC");
        }
        setCurrentPage(1);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery(searchInput);
        setCurrentPage(1);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Pass the active dashboard states to the API
            const response = await exportStudentsCsv(sortBy, sortOrder, searchQuery);
            
            // Convert Blob to URL
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            
            // Create hidden link to trigger download
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "students_export.csv");
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            // Catch specific 404 errors if backend throws them for empty results
            if (error.response && error.response.status === 404) {
                showAlert("No students found to export with current filters.", "error");
            } else {
                showAlert("Failed to export students data", "error");
            }
            console.error("Export Error:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleJumpSubmit = (e) => {
        e.preventDefault();
        const pageNum = Number(jumpPage);
        if (pageNum >= 1 && pageNum <= totalPages) {
            setCurrentPage(pageNum);
            setJumpPage("");
        } else {
            showAlert(`Please enter a valid page number between 1 and ${totalPages}`, "error");
        }
    };

    useEffect(() => {
        if (!loading && (!user || role !== "admin")) {
            navigate("/profile", { replace: true });
        }
    }, [user, role, loading, navigate]);

    const fetchStudents = useCallback(async () => {
        setIsFetchingStudents(true);
        try {
            const { data } = await getAllStudents(currentPage, limit, sortBy, sortOrder, searchQuery);

            if (data && data.students && Array.isArray(data.students)) {
                setStudents(data.students);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotalStudents(data.pagination?.totalStudents || null);
            } else if (Array.isArray(data)) {
                setStudents(data);
                setTotalPages(1);
            } else {
                setStudents([]);
            }
        } catch (error) {
            console.error("Failed to fetch students", error);
            setStudents([]);
        } finally {
            setIsFetchingStudents(false);
        }
    }, [currentPage, limit, sortBy, sortOrder, searchQuery]);

    useEffect(() => {
        if (activeTab === "students") {
            (async () => {
                await fetchStudents();
            })();
        }
    }, [activeTab, currentPage, fetchStudents]);

    // --- NEW: Selection Handlers ---
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(students.map((s) => s.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    // --- NEW: Bulk Delete Handler ---
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const isConfirmed = await showConfirm(
            `Are you sure you want to permanently delete ${selectedIds.length} selected student(s)?`,
        );
        if (!isConfirmed) return;

        setIsBulkDeleting(true);
        try {
            await bulkDeleteStudents({ ids: selectedIds });
            showAlert(`${selectedIds.length} student(s) deleted successfully.`, "success");
            setSelectedIds([]);
            fetchStudents(); // Refresh the table
        } catch {
            showAlert("Failed to delete selected students.", "error");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploadStatus({ loading: true });
        try {
            const { data } = await uploadStudentsCsv(formData);
            setUploadStatus({ loading: false });
            setFile(null);
            document.getElementById("csv-upload").value = "";

            // --- UPDATED: Use the standalone component ---
            if (data.errors && data.errors.length > 0) {
                showAlert(<ErrorReport data={data} />, "error");
            } else {
                showAlert(data.message || "CSV Uploaded successfully", "success");
            }

            fetchStudents();
        } catch (error) {
            setUploadStatus({ loading: false });
            const errMsg = error.response?.data?.error || "An unexpected upload error occurred.";
            showAlert(errMsg, "error");
        }
    };

    // --- NEW: Handle Manual Add Student ---
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setIsAdding(true);
        try {
            await addStudent(newStudent);
            setIsAddingStudent(false);
            setNewStudent({ roll_no: "", name: "", email: "", hostel_name: "", room_no: "", floor_no: "" });
            fetchStudents(); // Refresh the table
            showAlert("Student added successfully", "success");
        } catch (error) {
            showAlert(error.response?.data?.error || "Failed to add student", "error");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await showConfirm("Are you sure you want to delete this student?");
        if (!isConfirmed) return;
        setDeletingId(id);
        try {
            await deleteStudent(id);
            fetchStudents();
            showAlert("Student deleted successfully", "success");
        } catch (error) {
            showAlert(error.response?.data?.error || "Failed to delete student", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await updateStudent(editingStudent.id, editingStudent);
            setIsEditing(false);
            setEditingStudent({ roll_no: "", name: "", email: "", hostel_name: "", room_no: "", floor_no: "" });
            fetchStudents();
            showAlert("Student updated successfully", "success");
        } catch (error) {
            showAlert(error.response?.data?.error || "Failed to update student", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const columns = [
        { key: "sno", label: "S.no", sortable: false, render: (_, idx) => idx + 1 + (currentPage - 1) * limit },
        { key: "roll_no", label: "Roll No", sortable: true, render: (row) => row.roll_no || "------" },
        { key: "name", label: "Name", sortable: true },
        { key: "email", label: "Email", sortable: true },
        { key: "hostel_name", label: "Hostel", sortable: true, render: (row) => row.hostel_name || "N/A" },
        {
            key: "room_no",
            label: "Room",
            sortable: true,
            render: (row) => (row.room_no ? `${row.room_no} (Fl ${row.floor_no})` : "N/A"),
        },
        {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (row) => (
                <div className={styles.actions}>
                    <button
                        onClick={() => {
                            setIsEditing(true);
                            setEditingStudent(row);
                        }}
                        className={styles.iconBtn}
                        title="Edit"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                        className={`${styles.iconBtn} ${styles.danger}`}
                        title="Delete"
                    >
                        {deletingId === row.id ? <Loader2 size={16} className={styles.spin} /> : <Trash2 size={16} />}
                    </button>
                </div>
            ),
        },
    ];

    if (loading) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Your Dashboard</h1>
                <p>Manage hostel allotments and student records.</p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === "students" ? styles.active : ""}`}
                    onClick={() => handleTabChange("students")}
                >
                    <Users size={18} /> Student Records
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === "upload" ? styles.active : ""}`}
                    onClick={() => handleTabChange("upload")}
                >
                    <Upload size={18} /> Upload Data (CSV)
                </button>
            </div>

            {activeTab === "upload" ? (
                <div className={styles.card}>
                    <h2>Upload Allotment List</h2>
                    <p className={styles.infoText}>
                        Upload a CSV file containing: <strong>roll no, name, room no, floor, hostel_name</strong>
                    </p>
                    <form onSubmit={handleUpload} className={styles.uploadForm}>
                        <div className={styles.fileInputContainer}>
                            {/* Hidden actual input */}
                            <input
                                type="file"
                                id="csv-upload"
                                accept=".csv"
                                onChange={(e) => setFile(e.target.files[0])}
                                required
                                className={styles.hiddenInput}
                            />

                            {/* Conditional Rendering based on file selection */}
                            {file ? (
                                <div className={styles.fileSelectedCard}>
                                    <FileText size={40} className={styles.fileIcon} />
                                    <span className={styles.fileName}>{file.name}</span>
                                    <Button
                                        type="button"
                                        variant="remove"
                                        onClick={() => {
                                            setFile(null);
                                            document.getElementById("csv-upload").value = "";
                                        }}
                                        icon={X}
                                    >
                                        {" "}
                                        Remove File{" "}
                                    </Button>
                                </div>
                            ) : (
                                <label htmlFor="csv-upload" className={styles.fileLabel}>
                                    <UploadCloud size={48} className={styles.uploadIcon} />
                                    <span className={styles.uploadPrompt}>
                                        <strong>Click to browse</strong> for a file
                                    </span>
                                    <span className={styles.uploadSubPrompt}>CSV format only</span>
                                </label>
                            )}
                        </div>
                        <Button type="submit" disabled={uploadStatus.loading || !file} isLoading={uploadStatus.loading}>
                            {uploadStatus.loading ? "Processing..." : "Upload & Sync"}
                        </Button>
                    </form>
                </div>
            ) : (
                <div className={styles.card}>
                    {/* --- ENHANCED: Header with Add Student Button --- */}
                    <div className={styles.studentToolbar}>
                        <div className={styles.leftToolbar}>
                            <h2>Registered Students {totalStudents && `(${totalStudents})`}</h2>
                            <div className={styles.leftBtns}>
                                {/* Refresh button */}
                                <Button
                                    variant="primary"
                                    isLoading={isFetchingStudents}
                                    onClick={fetchStudents}
                                    disabled={isFetchingStudents}
                                    icon={RefreshCw}
                                    useIconForLoader={true}
                                    slim={true}
                                />

                                {/* Export button */}
                                <Button
                                    variant="primary"
                                    isLoading={isExporting}
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    icon={Download}
                                    slim={true}
                                >
                                    {isExporting ? "Exporting..." : "Export CSV"}
                                </Button>
                            </div>
                        </div>

                        <div className={styles.rightToolbar}>
                            {/* --- Search Bar --- */}
                            <form onSubmit={handleSearchSubmit} className={styles.formSearch}>
                                <Input
                                    type="text"
                                    placeholder="Search student..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    slim={true}
                                />
                                <Button type="submit" slim={true} icon={Search} />
                            </form>

                            {/* --- NEW: Bulk Delete Button --- */}
                            {selectedIds.length > 0 && (
                                <Button
                                    onClick={handleBulkDelete}
                                    disabled={isBulkDeleting}
                                    icon={Trash2}
                                    isLoading={isBulkDeleting}
                                >
                                    {isBulkDeleting ? "Deleting" : "Delete"} ({selectedIds.length})
                                </Button>
                            )}
                            <Button onClick={() => setIsAddingStudent(true)} slim={true} icon={Plus} />
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        data={students}
                        isLoading={isFetchingStudents}
                        emptyMessage="No students found."
                        loadingMessage="Loading student records..."
                        // Sort logic
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        // Selection logic
                        selectable={true}
                        selectedIds={selectedIds}
                        onSelectAll={handleSelectAll}
                        onSelectOne={handleSelectOne}
                    />
                    {/* Pagination */}
                    {!isFetchingStudents && students.length > 0 && (
                        <div className={styles.paginationWrapper}>
                            <div className={styles.limitSelector}>
                                <label>Rows per page: </label>
                                <select value={limit} onChange={handleLimitChange} className={styles.limitSelect}>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value={200}>200</option>
                                    <option value={totalStudents}>All</option>
                                </select>
                            </div>

                            <div className={styles.pagination}>
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className={styles.pageBtn}
                                >
                                    Previous
                                </button>
                                <span className={styles.pageInfo}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className={styles.pageBtn}
                                >
                                    Next
                                </button>
                            </div>

                            <form onSubmit={handleJumpSubmit} className={styles.jumpForm}>
                                <label>Go to: </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    value={jumpPage}
                                    onChange={(e) => setJumpPage(e.target.value)}
                                    className={styles.jumpInput}
                                    placeholder="Page"
                                />
                                <button type="submit" className={styles.jumpBtn} disabled={!jumpPage}>
                                    Go
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Add Student Modal */}
            <Modal
                isOpen={isAddingStudent}
                onClose={() => setIsAddingStudent(false)}
                title="Add New Student"
                disableClose={isAdding}
            >
                <form onSubmit={handleAddSubmit} className={styles.form}>
                    <FormRow>
                        <Input
                            label="Roll No *"
                            value={newStudent.roll_no}
                            onChange={(e) => setNewStudent({ ...newStudent, roll_no: e.target.value })}
                            disabled={isAdding}
                            required
                            slim={true}
                        />
                        <Input
                            label="Full Name *"
                            value={newStudent.name}
                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                            disabled={isAdding}
                            required
                            slim={true}
                        />
                    </FormRow>
                    <FormRow>
                        <Input
                            label="Email Address *"
                            type="email"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            disabled={isAdding}
                            required
                            slim={true}
                        />
                    </FormRow>
                    <FormRow>
                        <Select
                            label="Hostel"
                            value={newStudent.hostel_name}
                            onChange={(e) => setNewStudent({ ...newStudent, hostel_name: e.target.value })}
                            disabled={isAdding}
                            slim={true}
                            options={HOSTEL_OPTIONS}
                        />
                        <Input
                            label="Room no"
                            type="number"
                            value={newStudent.room_no}
                            onChange={(e) => setNewStudent({ ...newStudent, room_no: e.target.value })}
                            disabled={isAdding}
                            slim={true}
                        />
                        <Input
                            label="Floor no"
                            type="number"
                            value={newStudent.floor_no}
                            onChange={(e) => setNewStudent({ ...newStudent, floor_no: e.target.value })}
                            disabled={isAdding}
                            slim={true}
                        />
                    </FormRow>
                    <Button
                        type="submit"
                        disabled={isAdding}
                        icon={Plus}
                        isLoading={isAdding}
                        style={{ width: "100%" }}
                    >
                        {isAdding ? "Adding" : "Add Student"}
                    </Button>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                title="Edit Student"
                disableClose={isUpdating}
            >
                <form onSubmit={handleUpdate} className={styles.form}>
                    <FormRow>
                        <Input
                            label="Roll No *"
                            value={editingStudent.roll_no}
                            onChange={(e) => setEditingStudent({ ...editingStudent, roll_no: e.target.value })}
                            disabled={isUpdating}
                            required
                            slim={true}
                        />
                        <Input
                            label="Full Name *"
                            value={editingStudent.name}
                            onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                            disabled={isUpdating}
                            required
                            slim={true}
                        />
                    </FormRow>
                    <FormRow>
                        <Input
                            label="Email Address *"
                            type="email"
                            value={editingStudent.email}
                            onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                            disabled={isUpdating}
                            required
                            slim={true}
                        />
                    </FormRow>
                    <FormRow>
                        <Select
                            label="Hostel"
                            value={editingStudent.hostel_name}
                            onChange={(e) => setEditingStudent({ ...editingStudent, hostel_name: e.target.value })}
                            disabled={isUpdating}
                            slim={true}
                            options={HOSTEL_OPTIONS}
                        />
                        <Input
                            label="Room no"
                            type="number"
                            value={editingStudent.room_no}
                            onChange={(e) => setEditingStudent({ ...editingStudent, room_no: e.target.value })}
                            disabled={isUpdating}
                            slim={true}
                        />
                        <Input
                            label="Floor no"
                            type="number"
                            value={editingStudent.floor_no}
                            onChange={(e) => setEditingStudent({ ...editingStudent, floor_no: e.target.value })}
                            disabled={isUpdating}
                            slim={true}
                        />
                    </FormRow>
                    <Button
                        type="submit"
                        disabled={isUpdating}
                        icon={Check}
                        isLoading={isUpdating}
                        style={{ width: "100%" }}
                    >
                        {isUpdating ? "Saving" : "Save Changes"}
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
