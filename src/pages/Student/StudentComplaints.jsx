import { useState, useEffect, useCallback } from "react";
import { getStudentComplaints, lodgeComplaint, escalateComplaint, submitComplaintFeedback, aiAssistComplaint } from "../../api";
import { FormRow, Input, Select, FormActions } from "../../components/FormElements/FormElements";
import { Button } from "../../components/Buttons/Button";
import { Table } from "../../components/Table/Table";
import { useAlert } from "../../context/AlertContext";
import styles from "./StudentComplaints.module.css";
import ComplaintDetailModal from "../../components/ComplaintDetailModal/ComplaintDetailModal";
import { DEPARTMENT_SUBCATEGORIES } from "../Types_of_complaints";
import Modal from "../../components/Modal/Modal";
import Pagination from "../../components/Pagination/Pagination";

const StudentComplaints = () => {
    const { showAlert, showConfirm } = useAlert();
    const [stats, setStats] = useState({ initiated: 0, resolved: 0, escalated: 0 });
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isEscalating, setIsEscalating] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(5);
    const [statusFilter, setStatusFilter] = useState("");
    const [totalComplaints, setTotalComplaints] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    // AI Form State
    const [complaintMode, setComplaintMode] = useState("manual"); // 'manual' or 'ai'
    const [aiDescriptionInput, setAiDescriptionInput] = useState("");
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiResult, setAiResult] = useState(null);

    // Form State
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        department: "Sanitation",
        sub_category: DEPARTMENT_SUBCATEGORIES["Sanitation"][0],
        description: "",
    });

    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [feedbackData, setFeedbackData] = useState({ rating: 5, feedback: "" });

    const loadData = useCallback(async () => {
        setIsFetching(true);
        try {
            const { data } = await getStudentComplaints(currentPage, limit, statusFilter);
            setStats(data.stats);
            setHistory(data.history);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalComplaints(data.pagination?.totalRecords);
        } catch (err) {
            showAlert(err.response?.data?.error || "Failed to load dashboard data.", "error");
        } finally {
            setIsFetching(false);
        }
    }, [showAlert, statusFilter, currentPage, limit]);

    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setCurrentPage(1);
    };

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDepartmentChange = (e) => {
        const newDept = e.target.value;
        const subCategories = DEPARTMENT_SUBCATEGORIES[newDept] || [];

        setFormData({
            ...formData,
            department: newDept,
            sub_category: subCategories.length > 0 ? subCategories[0] : "",
        });
    };

    const handleAIAssist = async (e) => {
        e.preventDefault();
        if (!aiDescriptionInput.trim()) {
            return showAlert("Please describe the issue.", "error");
        }
        setIsGeneratingAI(true);
        try {
            const formData = new FormData();
            formData.append("description", aiDescriptionInput);
            if (file) {
                formData.append("complaint_image", file);
            }
            const { data } = await aiAssistComplaint(formData);
            setAiResult(data);
            showAlert("AI successfully analyzed your issue. Please review and confirm.", "success");
        } catch (err) {
            showAlert(err.response?.data?.error || "AI assist failed.", "error");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleLodgeAIAssisted = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData();
        data.append("department", aiResult.department);
        data.append("sub_category", aiResult.sub_category);
        data.append("description", aiResult.description);
        data.append("priority_score", aiResult.priority_score);
        if (file) data.append("complaint_image", file);

        try {
            await lodgeComplaint(data);
            showAlert("AI-assisted Complaint lodged successfully!", "success");
            setAiResult(null);
            setAiDescriptionInput("");
            setFile(null);
            loadData();
        } catch (err) {
            showAlert(err.response?.data?.error || "Failed to lodge complaint.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach((key) => data.append(key, formData[key]));
        if (file) data.append("complaint_image", file);

        try {
            await lodgeComplaint(data);
            showAlert("Complaint lodged successfully!", "success");
            setFormData({ department: "", sub_category: "", description: "" });
            setFile(null);
            e.target.reset();
            loadData();
        } catch (err) {
            showAlert(err.response?.data?.error || "Failed to lodge complaint.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEscalate = async (id) => {
        const isConfirmed = await showConfirm(
            "Are you sure you want to escalate this complaint to higher authorities?",
        );
        if (!isConfirmed) return;

        setIsEscalating(true);

        try {
            await escalateComplaint(id);
            showAlert("Complaint escalated successfully.", "success");
            loadData();
        } catch (err) {
            showAlert(err.response?.data?.error || "Failed to escalate complaint.", "error");
        } finally {
            setIsEscalating(false);
        }
    };

    const handleOpenFeedbackModal = (complaint) => {
        setSelectedComplaint(complaint);
        setFeedbackData({ rating: 5, feedback: "" });
        setIsFeedbackModalOpen(true);
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingFeedback(true);
        try {
            await submitComplaintFeedback(selectedComplaint.id, feedbackData);
            showAlert("Feedback submitted successfully!", "success");
            setIsFeedbackModalOpen(false);
            loadData();
        } catch (err) {
            showAlert(err.response?.data?.error || "Failed to submit feedback.", "error");
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    const handleViewDetails = (complaint) => {
        setSelectedComplaint(complaint);
        setIsModalOpen(true);
    };

    const getStatusBadge = (complaint) => {
        if (complaint.is_escalated)
            return <span className={`${styles.statusBadge} ${styles.escalated}`}>Escalated</span>;
        if (complaint.status === "Resolved")
            return <span className={`${styles.statusBadge} ${styles.resolved}`}>Resolved</span>;
        if (complaint.status === "Worker assigned")
            return <span className={`${styles.statusBadge} ${styles.assigned}`}>Worker Assigned</span>;
        return <span className={`${styles.statusBadge} ${styles.initiated}`}>Initiated</span>;
    };

    const isEscalationAllowed = (lodgedAt) => {
        if (!lodgedAt) return false;
        const lodgeDate = new Date(lodgedAt);
        const currentDate = new Date();
        const diffInTime = currentDate.getTime() - lodgeDate.getTime();
        const diffInDays = diffInTime / (1000 * 3600 * 24);
        return diffInDays >= 3;
    };

    const tableColumns = [
        { key: "complaint_no", label: "Comp. No.", render: (row) => `#${row.complaint_no}` },
        { key: "department", label: "Department" },
        { key: "sub_category", label: "Category" },
        { key: "status", label: "Status", render: (row) => getStatusBadge(row) },
        {
            key: "worker_name",
            label: "Assigned Worker",
            render: (row) =>
                row.worker_name ? (
                    <div>
                        <strong>{row.worker_name}</strong>
                        <br />
                        <small>{row.worker_phone}</small>
                    </div>
                ) : (
                    <i style={{ color: "var(--text-light)" }}>No worker assigned</i>
                ),
        },
        {
            key: "actions",
            label: "Action",
            render: (row) => {
                const canEscalate = isEscalationAllowed(row.lodged_at);
                const needsFeedback = row.status === "Resolved" && !row.rating;

                return (
                    <div style={{ display: "flex", gap: "8px" }}>
                        <Button variant="primary" onClick={() => handleViewDetails(row)}>
                            View
                        </Button>
                        {row.status !== "Resolved" && !row.is_escalated && (
                            <Button
                                variant="remove"
                                onClick={() => handleEscalate(row.id)}
                                disabled={!canEscalate}
                                title={!canEscalate && "Minimum 3 days after complaint"}
                                style={!canEscalate ? { opacity: 0.5, marginTop: "0" } : { marginTop: "0" }}
                                isLoading={isEscalating}
                            >
                                Escalate
                            </Button>
                        )}
                        {needsFeedback && (
                            <Button
                                variant="success"
                                onClick={() => handleOpenFeedbackModal(row)}
                                style={{ marginTop: "0" }}
                            >
                                Feedback
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>My Complaints Dashboard</h1>
                <p>Register new complaints and track their resolution status.</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>Pending</h3>
                    <p>{stats.initiated}</p>
                </div>
                <div className={`${styles.statCard} ${styles.resolved}`}>
                    <h3>Resolved</h3>
                    <p>{stats.resolved}</p>
                </div>
                <div className={`${styles.statCard} ${styles.escalated}`}>
                    <h3>Escalated</h3>
                    <p>{stats.escalated}</p>
                </div>
            </div>

            <div className={styles.formSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>Lodge a New Complaint</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button 
                            variant={complaintMode === "manual" ? "primary" : "remove"} 
                            onClick={() => setComplaintMode("manual")}
                            style={{ margin: 0, opacity: complaintMode === "manual" ? 1 : 0.6 }}
                        >Manual</Button>
                        <Button 
                            variant={complaintMode === "ai" ? "primary" : "remove"} 
                            onClick={() => setComplaintMode("ai")}
                            style={{ margin: 0, opacity: complaintMode === "ai" ? 1 : 0.6 }}
                        >✨ AI-assisted</Button>
                    </div>
                </div>

                {complaintMode === "manual" ? (
                    <form onSubmit={handleSubmit}>
                        <FormRow>
                            <Select
                                label="Department *"
                                name="department"
                                value={formData.department}
                                options={Object.keys(DEPARTMENT_SUBCATEGORIES).map((e) => ({ label: e, value: e }))}
                                onChange={handleDepartmentChange}
                                disabled={isLoading}
                                required
                            />
                            {/* Dynamic Sub-Category Input based on Selected Department */}
                            {DEPARTMENT_SUBCATEGORIES[formData.department]?.length > 0 ? (
                                <Select
                                    label="Sub Category *"
                                    value={formData.sub_category}
                                    onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                                    required
                                    disabled={isLoading}
                                    options={DEPARTMENT_SUBCATEGORIES[formData.department].map((sub) => ({
                                        value: sub,
                                        label: sub,
                                    }))}
                                />
                            ) : (
                                <Input
                                    type="text"
                                    label="Sub Category *"
                                    placeholder="e.g., Miscellaneous"
                                    value={formData.sub_category || ""}
                                    onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                                    disabled={isLoading}
                                />
                            )}
                        </FormRow>
                        <FormRow>
                            <Input
                                label="Description (Max 40 words) *"
                                name="description"
                                value={formData.description}
                                placeholder="Briefly describe the issue..."
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                            <Input
                                label="Upload Evidence (Image)"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </FormRow>
                        <FormActions>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Submitting..." : "Submit Complaint"}
                            </Button>
                        </FormActions>
                    </form>
                ) : (
                    <div>
                        {!aiResult ? (
                            <form key="ai-input-form" onSubmit={handleAIAssist}>
                                <FormRow>
                                    <Input
                                        label="Describe the problem (Max 40 words) *"
                                        name="aiDescription"
                                        value={aiDescriptionInput}
                                        placeholder="e.g. The fan in my room is making a loud noise and sparking..."
                                        onChange={(e) => setAiDescriptionInput(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Upload Evidence (Image) [Optional]"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                </FormRow>
                                <FormActions>
                                    <Button type="submit" disabled={isGeneratingAI}>
                                        {isGeneratingAI ? "AI is analyzing..." : "✨ Generate Details"}
                                    </Button>
                                </FormActions>
                            </form>
                        ) : (
                            <form key="ai-review-form" onSubmit={handleLodgeAIAssisted}>
                                <div style={{ backgroundColor: 'var(--bg-dark, #f4f4f5)', padding: '15px', borderRadius: '8px', marginBottom: '15px', color: '#333' }}>
                                    <h3 style={{ marginTop: 0 }}>Review AI Suggestions</h3>
                                    <p><strong>Department:</strong> {aiResult.department}</p>
                                    <p><strong>Sub Category:</strong> {aiResult.sub_category}</p>
                                    <p><strong>Refined Description:</strong> {aiResult.description}</p>
                                    <p><strong>Priority Score:</strong> <span style={{ fontWeight: 'bold', color: aiResult.priority_score === 'High' ? '#dc2626' : aiResult.priority_score === 'Medium' ? '#d97706' : '#16a34a'}}>{aiResult.priority_score}</span></p>
                                    {file && <p><strong>Image Evidence:</strong> Attached</p>}
                                </div>
                                <FormActions>
                                    <Button type="button" variant="remove" onClick={(e) => {
                                        // e.preventDefault();
                                        // e.stopPropagation();
                                        setAiResult(null);
                                    }} disabled={isLoading}>
                                        Edit / Retry
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Submitting..." : "Confirm & Lodge Complaint"}
                                    </Button>
                                </FormActions>
                            </form>
                        )}
                    </div>
                )}
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h2>Complaint History</h2>
                <div style={{ width: "220px" }}>
                    <Select
                        label="Filter by status"
                        name="statusFilter"
                        value={statusFilter}
                        onChange={handleFilterChange}
                        slim="true"
                        options={[
                            { label: "All Statuses", value: "" },
                            { label: "Initiated", value: "Initiated" },
                            { label: "Worker assigned", value: "Worker assigned" },
                            { label: "Resolved", value: "Resolved" },
                            { label: "Escalated", value: "Escalated" },
                        ]}
                    />
                </div>
            </div>
            <Table columns={tableColumns} data={history} isLoading={isFetching} emptyMessage="No complaints found." />
            {totalPages > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    limit={limit}
                    onLimitChange={handleLimitChange}
                    totalRecords={totalComplaints}
                    isLoading={isFetching}
                />
            )}

            {/* View Details Modal */}
            <ComplaintDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                complaint={selectedComplaint}
                role="student"
            />

            {/* NEW: Feedback Modal */}
            {isFeedbackModalOpen && selectedComplaint && (
                <Modal
                    title={`Feedback #${selectedComplaint.complaint_no}`}
                    isOpen={isFeedbackModalOpen}
                    onClose={() => setIsFeedbackModalOpen(false)}
                >
                    <form onSubmit={handleFeedbackSubmit}>
                        <FormRow>
                            <Select
                                label="Rating (1 to 5) *"
                                value={feedbackData.rating}
                                onChange={(e) => setFeedbackData({ ...feedbackData, rating: parseInt(e.target.value) })}
                                required
                                options={[
                                    { value: 5, label: "5 - Excellent" },
                                    { value: 4, label: "4 - Good" },
                                    { value: 3, label: "3 - Average" },
                                    { value: 2, label: "2 - Poor" },
                                    { value: 1, label: "1 - Terrible" },
                                ]}
                            />
                        </FormRow>
                        <FormRow>
                            <Input
                                label="Written Feedback (Optional)"
                                type="text"
                                placeholder="How was the service?"
                                value={feedbackData.feedback}
                                onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
                            />
                        </FormRow>
                        <FormActions>
                            <Button
                                type="button"
                                variant="remove"
                                onClick={() => setIsFeedbackModalOpen(false)}
                                disabled={isSubmittingFeedback}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmittingFeedback}>
                                {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                            </Button>
                        </FormActions>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default StudentComplaints;
