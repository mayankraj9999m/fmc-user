// src/pages/Admin/WardenDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { Users, Plus, Edit, Trash2, Check, RefreshCw, AlertCircle, Copy, Loader2, Star, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";
import { getWorkers, addWorker, updateWorker, deleteWorker } from "../../api";
import Modal from "../../components/Modal/Modal";
import { FormRow, Input, Select, FormActions } from "../../components/FormElements/FormElements";
import styles from "./AdminDashboard.module.css";
import { Button } from "../../components/Buttons/Button";
import { NoticeBox } from "../../components/NoticeBox/NoticeBox";
import CredentialsCard from "../../components/Card/CredentialsCard";
import { Table } from "../../components/Table/Table";
import { DEPARTMENT_SUBCATEGORIES } from "../Types_of_complaints";
import WorkerPerformance from "./WorkerPerformance";

// Map the top-level keys to be used in the Select dropdown
const DEPARTMENT_OPTIONS = Object.keys(DEPARTMENT_SUBCATEGORIES).map((dept) => ({
    value: dept,
    label: dept,
}));

const GENDER_OPTIONS = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
];

const WardenDashboard = () => {
    const { user, role } = useAuth();
    const { showAlert, showConfirm } = useAlert();

    const [activeTab, setActiveTab] = useState("manage");

    const [workers, setWorkers] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [newAccountDetails, setNewAccountDetails] = useState(null);

    // Form Data State
    const initialFormData = {
        name: "",
        email: "",
        phone_no: "",
        gender: "Male",
        department: "Civil", // Default to first available option
        sub_work_category: DEPARTMENT_SUBCATEGORIES["Civil"][0],
        password: "",
    };
    const [formData, setFormData] = useState(initialFormData);
    const [deletingId, setDeletingId] = useState(null);

    const fetchWorkers = useCallback(async () => {
        setIsFetching(true);
        try {
            const response = await getWorkers();
            setWorkers(response.data);
        } catch (error) {
            console.error(error.response);
            showAlert(error.response?.data?.error || "Failed to fetch workers", "error");
        } finally {
            setIsFetching(false);
        }
    }, [showAlert]);

    useEffect(() => {
        if (role === "admin" && (user?.position === "Hostel Warden" || user?.position === "Associate Warden")) {
            fetchWorkers();
        }
    }, [role, user, fetchWorkers]);

    const handleOpenAddModal = () => {
        setFormData(initialFormData);
        setNewAccountDetails(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (worker) => {
        setFormData({ ...worker, password: "" });
        setNewAccountDetails(null);
        setEditingWorker(worker);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = { ...formData };

            if (editingWorker) {
                await updateWorker(editingWorker.id, payload);
                showAlert("Worker updated successfully", "success");
                setIsAddModalOpen(false);
                setEditingWorker(null);
            } else {
                const response = await addWorker(payload);
                setNewAccountDetails({
                    email: response.data.worker.email,
                    password: response.data.generatedPassword,
                });
            }
            fetchWorkers();
        } catch (error) {
            showAlert(error.response?.data?.error || "Failed to save account", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        const isConfirmed = await showConfirm(`Are you sure you want to remove ${name}? This action cannot be undone.`);
        if (!isConfirmed) return;
        setDeletingId(id);

        try {
            await deleteWorker(id);
            showAlert("Worker removed successfully", "success");
            fetchWorkers();
        } catch (error) {
            showAlert(error.response?.data?.error || "Failed to delete worker", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(
                `Email: ${newAccountDetails.email}\nPassword: ${newAccountDetails.password}`,
            );
            showAlert("Credentials copied to clipboard!", "success");
            setNewAccountDetails(null);
            setIsAddModalOpen(false);
        } catch (err) {
            console.error(err);
            showAlert("Failed to copy credentials!", "error");
        }
    };

    const handleDepartmentChange = (e) => {
        const newDept = e.target.value;
        const subCategories = DEPARTMENT_SUBCATEGORIES[newDept] || [];

        setFormData({
            ...formData,
            department: newDept,
            // Auto-select the first sub-category if it exists, otherwise leave empty
            sub_work_category: subCategories.length > 0 ? subCategories[0] : "",
        });
    };

    const columns = [
        { key: "name", label: "Name" },
        { key: "department", label: "Department" },
        { key: "sub_work_category", label: "Category", render: (row) => row.sub_work_category || "-" },
        { key: "phone_no", label: "Phone No", render: (row) => row.phone_no || "N/A" },
        {
            key: "rating",
            label: "Rating",
            render: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    {row.current_rating} ({row.rating_count})
                </div>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className={styles.iconBtn} onClick={() => handleOpenEditModal(row)} title="Edit Worker">
                        <Edit size={16} />
                    </button>
                    <button
                        className={`${styles.iconBtn} ${styles.danger}`}
                        onClick={() => handleDelete(row.id, row.name)}
                        title="Remove Worker"
                    >
                        {deletingId === row.id ? <Loader2 size={16} className={styles.spin} /> : <Trash2 size={16} />}
                    </button>
                </div>
            ),
        },
    ];

    if (role !== "admin" || (user?.position !== "Hostel Warden" && user?.position !== "Associate Warden")) {
        return (
            <div className={styles.container}>
                <div className={styles.errorBox}>
                    <AlertCircle /> Access Restricted. Warden Authorization Required.
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Hostel Staff Management</h1>
                    <p className={styles.subtitle}>Manage workers and maintenance staff for your assigned hostel.</p>
                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === "manage" ? styles.active : ""}`}
                    onClick={() => setActiveTab("manage")}
                >
                    <Shield size={18} /> Manage Workers
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === "performance" ? styles.active : ""}`}
                    onClick={() => setActiveTab("performance")}
                >
                    <Shield size={18} /> Worker Performance
                </button>
            </div>

            {/* Conditional Rendering based on Tab */}
            {activeTab === "manage" ? (
                <div>
                    <div className={styles.card} style={{ marginTop: "2rem" }}>
                        <div className={styles.studentToolbar}>
                            <h2 style={{ margin: 0 }}>Registered Staff ({workers.length})</h2>
                            <Button
                                onClick={fetchWorkers}
                                isLoading={isFetching}
                                disabled={isFetching}
                                icon={RefreshCw}
                                slim={true}
                            ></Button>
                            <div className={styles.rightToolbar}>
                                <Button onClick={handleOpenAddModal} icon={Plus}>
                                    Onboard Staff
                                </Button>
                            </div>
                        </div>

                        <Table
                            columns={columns}
                            data={workers}
                            isLoading={isFetching}
                            emptyMessage="No workers found for your hostel."
                            loadingMessage="Loading staff data..."
                        />
                    </div>
                </div>
            ) : (
                <WorkerPerformance />
            )}

            <Modal
                isOpen={isAddModalOpen || editingWorker}
                onClose={() => {
                    if (!isSaving && !newAccountDetails) {
                        setIsAddModalOpen(false);
                        setEditingWorker(null);
                    }
                }}
                title={editingWorker ? "Edit Worker Profile" : "Onboard New Worker"}
                disableClose={isSaving || newAccountDetails}
                maxWidth="600px"
            >
                {newAccountDetails ? (
                    <div>
                        <NoticeBox success={true}>
                            <div>
                                <h3>Account Created Successfully!</h3>
                                <p>Please share these credentials with the worker to access the worker portal.</p>
                            </div>
                        </NoticeBox>
                        <NoticeBox urgent={true}>
                            <CredentialsCard details={newAccountDetails} />
                        </NoticeBox>
                        <Button
                            onClick={copyToClipboard}
                            icon={Copy}
                            style={{ width: "100%", justifyContent: "center" }}
                        >
                            Copy Credentials & Close
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <FormRow>
                            <Input
                                label="Full Name *"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={isSaving}
                            />
                            <Input
                                type="email"
                                label="Email Address *"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={isSaving}
                            />
                        </FormRow>

                        <FormRow>
                            <Input
                                type="tel"
                                label="Phone Number"
                                value={formData.phone_no || ""}
                                onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
                                disabled={isSaving}
                            />
                            <Select
                                label="Gender"
                                value={formData.gender || "Male"}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                disabled={isSaving}
                                options={GENDER_OPTIONS}
                            />
                        </FormRow>

                        <FormRow>
                            <Select
                                label="Department *"
                                value={formData.department}
                                onChange={handleDepartmentChange}
                                required
                                disabled={isSaving}
                                options={DEPARTMENT_OPTIONS}
                            />

                            {/* Dynamic Sub-Category Input based on Selected Department */}
                            {DEPARTMENT_SUBCATEGORIES[formData.department]?.length > 0 ? (
                                <Select
                                    label="Specific Category *"
                                    value={formData.sub_work_category}
                                    onChange={(e) => setFormData({ ...formData, sub_work_category: e.target.value })}
                                    required
                                    disabled={isSaving}
                                    options={DEPARTMENT_SUBCATEGORIES[formData.department].map((sub) => ({
                                        value: sub,
                                        label: sub,
                                    }))}
                                />
                            ) : (
                                <Input
                                    type="text"
                                    label="Specific Category (Optional)"
                                    placeholder="e.g., Miscellaneous"
                                    value={formData.sub_work_category || ""}
                                    onChange={(e) => setFormData({ ...formData, sub_work_category: e.target.value })}
                                    disabled={isSaving}
                                />
                            )}
                        </FormRow>

                        {editingWorker && (
                            <FormRow>
                                <Input
                                    type="password"
                                    label="Reset Password (leave blank to keep current)"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={isSaving}
                                    placeholder="••••••••"
                                />
                            </FormRow>
                        )}

                        {!editingWorker && (
                            <NoticeBox
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-start",
                                    gap: "0.5rem",
                                    marginBottom: "0px",
                                }}
                            >
                                <AlertCircle size={20} style={{ marginRight: "6px" }} />
                                <span>A secure login password will be auto-generated for the worker.</span>
                            </NoticeBox>
                        )}

                        <FormActions>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setEditingWorker(null);
                                }}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isSaving}
                                icon={editingWorker ? Check : Plus}
                                disabled={isSaving}
                            >
                                {editingWorker ? "Save Changes" : "Onboard Worker"}
                            </Button>
                        </FormActions>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default WardenDashboard;
