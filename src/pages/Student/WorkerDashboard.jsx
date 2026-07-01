import { useState, useEffect, useCallback } from "react";
import { getWorkerComplaints, resolveComplaint, summarizeWorkerComplaints } from "../../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FormRow, Input, FormActions, Select } from "../../components/FormElements/FormElements";
import { Button } from "../../components/Buttons/Button";
import { Table } from "../../components/Table/Table";
import { useAlert } from "../../context/AlertContext";
import ComplaintDetailModal from "../../components/ComplaintDetailModal/ComplaintDetailModal";
import Modal from "../../components/Modal/Modal";
import styles from "./StudentComplaints.module.css";
import Pagination from "../../components/Pagination/Pagination";

const WorkerDashboard = () => {
    const { showAlert } = useAlert();
    const [stats, setStats] = useState({ pending: 0, resolved: 0, defaulted: 0 });
    const [history, setHistory] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    // Modals State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [summaryData, setSummaryData] = useState("");
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(5);
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [totalComplaints, setTotalComplaints] = useState(null);

    // Resolve Form State
    const [resolveFile, setResolveFile] = useState(null);
    const [resolveMessage, setResolveMessage] = useState("");
    const [isResolving, setIsResolving] = useState(false);

    const loadData = useCallback(async () => {
        setIsFetching(true);
        try {
            const { data } = await getWorkerComplaints(currentPage, limit, statusFilter, priorityFilter);
            setStats(data.stats || { pending: 0, resolved: 0, defaulted: 0 });
            setHistory(data.history || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalComplaints(data.pagination?.totalRecords);
        } catch (err) {
            showAlert(err.response?.data?.error || "Failed to load dashboard data.", "error");
        } finally {
            setIsFetching(false);
        }
    }, [showAlert, currentPage, statusFilter, priorityFilter, limit]);

    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const handlePriorityFilterChange = (e) => {
        setPriorityFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setCurrentPage(1);
    };

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleViewDetails = (complaint) => {
        setSelectedComplaint(complaint);
        setIsDetailModalOpen(true);
    };

    const handleOpenResolveModal = (complaint) => {
        setSelectedComplaint(complaint);
        setResolveFile(null);
        setResolveMessage("");
        setIsResolveModalOpen(true);
    };

    const handleSummarize = async () => {
        setIsSummaryModalOpen(true);
        setIsSummarizing(true);
        setSummaryData("Generating summary...");
        try {
            const { data } = await summarizeWorkerComplaints();
            setSummaryData(data.summary);
        } catch (err) {
            setSummaryData("Failed to generate summary.");
            showAlert(err.response?.data?.error || "Failed to generate summary.", "error");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        if (!selectedComplaint) return;

        setIsResolving(true);
        const formData = new FormData();
        if (resolveFile) {
            formData.append("resolved_image", resolveFile);
        }
        if (resolveMessage.trim()) {
            formData.append("resolution_message", resolveMessage);
        }

        try {
            await resolveComplaint(selectedComplaint.id, formData);
            showAlert("Complaint resolved successfully!", "success");
            setIsResolveModalOpen(false);
            loadData();
        } catch (err) {
            showAlert(err.response?.data?.error || "Failed to resolve complaint.", "error");
        } finally {
            setIsResolving(false);
        }
    };

    const getStatusBadge = (complaint) => {
        if (complaint.is_escalated)
            return <span className={`${styles.statusBadge} ${styles.escalated}`}>Escalated</span>;
        if (complaint.status === "Resolved")
            return <span className={`${styles.statusBadge} ${styles.resolved}`}>Resolved</span>;
        if (complaint.status === "Worker assigned")
            return <span className={`${styles.statusBadge} ${styles.assigned}`}>Worker Assigned</span>;
        return <span className={`${styles.statusBadge} ${styles.initiated}`}>{complaint.status}</span>;
    };

    const tableColumns = [
        { key: "complaint_no", label: "Comp. No.", render: (row) => `#${row.complaint_no}` },
        {
            key: "assigned_at",
            label: "Assigned On",
            render: (row) => new Date(row.assigned_at || row.lodged_at).toLocaleDateString(),
        },
        { 
            key: "priority_score", 
            label: "Priority",
            render: (row) => (
                <span style={{
                    fontWeight: "bold",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    backgroundColor: row.priority_score === 'High' ? '#fee2e2' : row.priority_score === 'Medium' ? '#fef3c7' : '#dcfce7',
                    color: row.priority_score === 'High' ? '#dc2626' : row.priority_score === 'Medium' ? '#d97706' : '#16a34a'
                }}>
                    {row.priority_score || "N/A"}
                </span>
            )
        },
        { key: "description", label: "Issue" },
        {
            key: "location",
            label: "Location",
            render: (row) => `${row.hostel_name || "N/A"} - Room ${row.room_no || "N/A"}`,
        },
        { key: "status", label: "Status", render: (row) => getStatusBadge(row) },
        { 
            key: "rating", 
            label: "Rating", 
            render: (row) => row.rating ? `⭐ ${row.rating}` : "N/A" 
        },
        {
            key: "actions",
            label: "Action",
            render: (row) => {
                const canResolve = !row.is_escalated && row.status != "Resolved";
                return (
                    <div style={{ display: "flex", gap: "8px" }}>
                        <Button variant="primary" onClick={() => handleViewDetails(row)}>
                            View
                        </Button>
                        {row.status != "Resolved" && (
                            <Button
                                variant="success"
                                onClick={() => handleOpenResolveModal(row)}
                                disabled={!canResolve}
                            >
                                Resolve
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
                <h1>Worker Dashboard</h1>
                <p>View and manage the resolution of your assigned complaints.</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>Pending Tasks</h3>
                    <p>{stats.pending}</p>
                </div>
                <div className={`${styles.statCard} ${styles.resolved}`}>
                    <h3>Resolved Tasks</h3>
                    <p>{stats.resolved}</p>
                </div>
                <div className={`${styles.statCard} ${styles.escalated}`}>
                    <h3>Escalated</h3>
                    <p>{stats.defaulted}</p>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <h2>My Assigned Complaints</h2>
                    <Button variant="primary" onClick={handleSummarize} disabled={isSummarizing} slim={true}>
                        ✨ AI Summarize
                    </Button>
                </div>
                <div style={{ display: "flex", gap: "15px" }}>
                    <div style={{ width: "220px" }}>
                        <Select
                            label="Filter by Priority"
                            name="priorityFilter"
                            value={priorityFilter}
                            onChange={handlePriorityFilterChange}
                            slim="true"
                            options={[
                                { label: "All Priorities", value: "" },
                                { label: "High", value: "High" },
                                { label: "Medium", value: "Medium" },
                                { label: "Low", value: "Low" },
                            ]}
                        />
                    </div>
                    <div style={{ width: "220px" }}>
                    <Select
                        label="Filter by status"
                        name="statusFilter"
                        value={statusFilter}
                        onChange={handleFilterChange}
                        slim="true"
                        options={[
                            { label: "All Statuses", value: "" },
                            { label: "Worker Assigned", value: "Worker assigned" },
                            { label: "Resolved", value: "Resolved" },
                            { label: "Defaulted (Escalated)", value: "Escalated" },
                        ]}
                    />
                </div>
                </div>
            </div>
            <Table
                columns={tableColumns}
                data={history}
                isLoading={isFetching}
                emptyMessage="You have no assigned complaints right now."
            />
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
            {isDetailModalOpen && selectedComplaint && (
                <ComplaintDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    complaint={selectedComplaint}
                    role="worker"
                    extraDetails={[
                        { label: "Student Name", value: selectedComplaint.student_name },
                        { label: "Student Phone", value: selectedComplaint.student_phone },
                        {
                            label: "Hostel & Room",
                            value: `${selectedComplaint.hostel_name} - Room ${selectedComplaint.room_no}`,
                        },
                    ]}
                />
            )}

            {/* Resolve Complaint Modal */}
            {isResolveModalOpen && selectedComplaint && (
                <Modal
                    title={`Resolve Complaint #${selectedComplaint.complaint_no}`}
                    isOpen={isResolveModalOpen}
                    onClose={() => setIsResolveModalOpen(false)}
                >
                    <div>
                        <p style={{ marginBottom: "20px", color: "var(--text-secondary)" }}>
                            <strong>Location:</strong> Room {selectedComplaint.room_no} (
                            {selectedComplaint.student_name})
                        </p>

                        <form onSubmit={handleResolveSubmit}>
                            <FormRow>
                                <Input
                                    label="Resolution Message (Optional)"
                                    type="text"
                                    placeholder="Message (optional).."
                                    value={resolveMessage}
                                    onChange={(e) => setResolveMessage(e.target.value)}
                                    disabled={isResolving}
                                />
                            </FormRow>
                            <FormRow>
                                <Input
                                    label="Upload Resolution Proof (Optional Image)"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setResolveFile(e.target.files[0])}
                                    disabled={isResolving}
                                />
                            </FormRow>

                            <FormActions>
                                <Button
                                    type="button"
                                    variant="remove"
                                    onClick={() => setIsResolveModalOpen(false)}
                                    disabled={isResolving}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isResolving}>
                                    {isResolving ? "Resolving..." : "Mark as Resolved"}
                                </Button>
                            </FormActions>
                        </form>
                    </div>
                </Modal>
            )}
            {/* AI Summary Modal */}
            {isSummaryModalOpen && (
                <Modal
                    title="AI Workload Summary"
                    isOpen={isSummaryModalOpen}
                    onClose={() => setIsSummaryModalOpen(false)}
                >
                    <div className="markdown-content" style={{ padding: "10px" }}>
                        {isSummarizing ? (
                            <p>Generating summary...</p>
                        ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summaryData}</ReactMarkdown>
                        )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                        <Button variant="secondary" onClick={() => setIsSummaryModalOpen(false)}>
                            Close
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default WorkerDashboard;
