// src/pages/Admin/ChiefWardenDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { Shield, Plus, Edit, Trash2, Check, RefreshCw, AlertCircle, Copy, Users, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";
import { getWardens, addWarden, updateWarden, deleteWarden } from "../../api";
import Modal from "../../components/Modal/Modal";
import { FormRow, Input, Select, FormActions } from "../../components/FormElements/FormElements";
import styles from "./AdminDashboard.module.css"; // Reuse your existing dashboard styles
import { Button } from "../../components/Buttons/Button";
import { HOSTEL_OPTIONS } from "../Hostels";
import { NoticeBox } from "../../components/NoticeBox/NoticeBox";
import CredentialsCard from "../../components/Card/CredentialsCard";
import { Table } from "../../components/Table/Table";

const POSITION_OPTIONS = [
    { value: "Hostel Warden", label: "Hostel Warden" },
    { value: "Associate Warden", label: "Associate Warden" },
    { value: "Junior Assistant", label: "Junior Assistant" },
];

const ChiefWardenDashboard = () => {
    const { user, role } = useAuth();
    const { showAlert, showConfirm } = useAlert();
    const [activeTab, setActiveTab] = useState("management"); // Tabs

    const [wardens, setWardens] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingWarden, setEditingWarden] = useState(null);
    const [newAccountDetails, setNewAccountDetails] = useState(null); // Stores auto-generated password

    // Form Data State
    const initialFormData = { name: "", email: "", phone_no: "", position: "", hostel_name: "", password: "" };
    const [formData, setFormData] = useState(initialFormData);
    const [deletingId, setDeletingId] = useState(null);

    const fetchWardens = useCallback(async () => {
        setIsFetching(true);
        try {
            const response = await getWardens();
            setWardens(response.data);
        } catch (error) {
            console.error(error);
            showAlert("Failed to fetch administrative accounts", "error");
        } finally {
            setIsFetching(false);
        }
    }, [showAlert]);

    useEffect(() => {
        if (role === "admin" && user?.position === "Chief Warden") {
            fetchWardens();
        }
    }, [role, user, fetchWardens]);

    const handleOpenAddModal = () => {
        setFormData(initialFormData);
        setNewAccountDetails(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (warden) => {
        setFormData({ ...warden, password: "" }); // Never pre-fill password for security
        setNewAccountDetails(null);
        setEditingWarden(warden);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = { ...formData };
            // Junior Assistants have global access, so they shouldn't be tied to one hostel
            if (payload.position === "Junior Assistant") payload.hostel_name = "";

            if (editingWarden) {
                await updateWarden(editingWarden.id, payload);
                showAlert("Account updated successfully", "success");
                setIsAddModalOpen(false);
                setEditingWarden(null);
            } else {
                const response = await addWarden(payload);
                // Display the generated password for the Chief Warden to copy
                setNewAccountDetails({
                    email: response.data.admin.email,
                    password: response.data.generatedPassword,
                });
            }
            fetchWardens();
        } catch (error) {
            showAlert(error.response?.data?.error || "Failed to save account", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        const isConfirmed = await showConfirm(
            `Are you sure you want to delete the account for ${name}? This action cannot be undone.`,
        );
        if (!isConfirmed) return;
        setDeletingId(id);

        try {
            await deleteWarden(id);
            showAlert("Account deleted successfully", "success");
            fetchWardens();
        } catch (error) {
            showAlert(error.response?.data?.error || "Failed to delete account", "error");
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

    const columns = [
        { key: "name", label: "Name" },
        { key: "position", label: "Position" },
        { key: "hostel_name", label: "Assigned Hostel", render: (row) => row.hostel_name || "Global Access" },
        { key: "email", label: "Email" },
        { key: "phone_no", label: "Phone No" },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className={styles.iconBtn} onClick={() => handleOpenEditModal(row)} title="Edit Account">
                        <Edit size={16} />
                    </button>
                    <button
                        className={`${styles.iconBtn} ${styles.danger}`}
                        onClick={() => handleDelete(row.id, row.name)}
                        title="Delete Account"
                    >
                        {deletingId === row.id ? <Loader2 size={16} className={styles.spin} /> : <Trash2 size={16} />}
                    </button>
                </div>
            ),
        },
    ];

    // Strict Access Control Check
    if (role !== "admin" || user?.position !== "Chief Warden") {
        return (
            <div className={styles.container}>
                <div className={styles.errorBox}>
                    <AlertCircle /> Access Restricted. Chief Warden Authorization Required.
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Chief Warden Operations</h1>
                    <p className={styles.subtitle}>Manage campus administration and staff credentials.</p>
                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === "management" ? styles.active : ""}`}
                    onClick={() => setActiveTab("management")}
                >
                    <Shield size={18} /> Admin Management
                </button>
                {/* Future tabs can be added here (e.g., Global Analytics) */}
            </div>

            {activeTab === "management" && (
                <div className={styles.card}>
                    <div className={styles.studentToolbar}>
                        <h2 style={{ margin: 0 }}>Registered Staff ({wardens.length})</h2>
                        <Button
                            onClick={fetchWardens}
                            isLoading={isFetching}
                            disabled={isFetching}
                            icon={RefreshCw}
                            slim={true}
                        ></Button>
                        <div className={styles.rightToolbar}>
                            <Button onClick={handleOpenAddModal} icon={Plus}>
                                Create New Account
                            </Button>
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        data={wardens}
                        isLoading={isFetching}
                        emptyMessage="No admin accounts found."
                        loadingMessage="Loading admin accounts..."
                    />
                </div>
            )}

            {/* --- ADD / EDIT ADMIN MODAL --- */}
            <Modal
                isOpen={isAddModalOpen || editingWarden}
                onClose={() => {
                    if (!isSaving && !newAccountDetails) {
                        setIsAddModalOpen(false);
                        setEditingWarden(null);
                    }
                }}
                title={editingWarden ? "Edit Admin Account" : "Create Admin Account"}
                disableClose={isSaving || newAccountDetails}
                maxWidth="600px"
            >
                {newAccountDetails ? (
                    <div>
                        <NoticeBox success={true}>
                            <p>
                                <h3>Account Created Successfully!</h3>
                                <p>
                                    Please share these credentials securely with the Warden. They will be forced to
                                    change this password on their first login.
                                </p>
                            </p>
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
                            <Select
                                label="Role/Position *"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                required
                                disabled={isSaving}
                                options={POSITION_OPTIONS}
                            />

                            {/* Only require Hostel for Wardens. Junior Assistants don't strictly need one. */}
                            <Select
                                label={`Assigned Hostel ${formData.position !== "Junior Assistant" ? "*" : ""}`}
                                value={formData.hostel_name || ""}
                                onChange={(e) => setFormData({ ...formData, hostel_name: e.target.value })}
                                required={formData.position !== "Junior Assistant"}
                                disabled={isSaving || formData.position === "Junior Assistant"}
                                options={HOSTEL_OPTIONS}
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

                            {/* ONLY show password field if EDITING (so Chief Warden can manually reset it if someone forgets their password) */}
                            {editingWarden && (
                                <Input
                                    type="password"
                                    label="Reset Password (leave blank to keep current)"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={isSaving}
                                    placeholder="••••••••"
                                />
                            )}
                        </FormRow>

                        {!editingWarden && (
                            <NoticeBox
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-start",
                                    gap: "0.5rem",
                                    marginBottom: "0px",
                                }}
                            >
                                <AlertCircle size={20} style={{ marginRight: "6px" }} />
                                <span>A secure password will be auto-generated.</span>
                            </NoticeBox>
                        )}

                        <FormActions>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setEditingWarden(null);
                                }}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isSaving}
                                icon={editingWarden ? Check : Plus}
                                disabled={isSaving}
                            >
                                {editingWarden ? "Update Account" : "Create Account"}
                            </Button>
                        </FormActions>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default ChiefWardenDashboard;
