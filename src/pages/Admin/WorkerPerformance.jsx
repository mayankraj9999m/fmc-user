// src/pages/Admin/WorkerPerformance.jsx
import { useState, useEffect, useCallback } from "react";
import { getWorkerPerformance, getWorkerComplaintsByWarden, summarizeWorkerPerformance } from "../../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Table } from "../../components/Table/Table";
import { Select } from "../../components/FormElements/FormElements";
import { Button } from "../../components/Buttons/Button";
import Modal from "../../components/Modal/Modal";
import Pagination from "../../components/Pagination/Pagination";
import ComplaintDetailModal from "../../components/ComplaintDetailModal/ComplaintDetailModal";
import { useAlert } from "../../context/AlertContext";
import { DEPARTMENT_SUBCATEGORIES } from "../Types_of_complaints";
import styles from "../Student/StudentComplaints.module.css";
// Remove Loader2 and ComplaintCard imports since Table handles them now

const WorkerPerformance = () => {
    const { showAlert } = useAlert();
    const [performanceData, setPerformanceData] = useState([]);
    const [stats, setStats] = useState({ totalResolved: 0, totalDefaulted: 0, totalPending: 0 });
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [summaryData, setSummaryData] = useState("");
    const [isSummarizing, setIsSummarizing] = useState(false);

    // --- Modal & Specific Worker States ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [workerComplaints, setWorkerComplaints] = useState([]);
    const [isFetchingComplaints, setIsFetchingComplaints] = useState(false);

    // --- Detailed Complaint Modal States ---
    const [isComplaintDetailModalOpen, setIsComplaintDetailModalOpen] = useState(false);
    const [selectedComplaintDetail, setSelectedComplaintDetail] = useState(null);

    // Pagination specific to the modal table
    const [complaintsPage, setComplaintsPage] = useState(1);
    const [complaintsLimit, setComplaintsLimit] = useState(5);
    const [complaintsTotalPages, setComplaintsTotalPages] = useState(1);
    const [complaintsTotalRecords, setComplaintsTotalRecords] = useState(0);
    const [priorityFilter, setPriorityFilter] = useState("");

    const loadPerformance = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await getWorkerPerformance(departmentFilter);
            setPerformanceData(data.workers);
            setStats(data.stats);
        } catch (err) {
            showAlert(err.response?.data?.error || "Failed to load worker performance.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [departmentFilter, showAlert]);

    useEffect(() => {
        loadPerformance();
    }, [loadPerformance]);

    // Fetch complaints when the modal opens or pagination changes
    const loadWorkerComplaints = useCallback(async () => {
        if (!selectedWorker) return;
        setIsFetchingComplaints(true);
        try {
            const { data } = await getWorkerComplaintsByWarden(selectedWorker.id, complaintsPage, complaintsLimit, priorityFilter);
            setWorkerComplaints(data.history);
            setComplaintsTotalPages(data.pagination.totalPages);
            setComplaintsTotalRecords(data.pagination.totalRecords);
        } catch (err) {
            showAlert(err.response?.data?.error || "Failed to load worker's complaints.", "error");
        } finally {
            setIsFetchingComplaints(false);
        }
    }, [selectedWorker, complaintsPage, complaintsLimit, priorityFilter, showAlert]);

    useEffect(() => {
        if (isModalOpen) {
            loadWorkerComplaints();
        }
    }, [loadWorkerComplaints, isModalOpen]);

    const handleViewTasks = (worker) => {
        setSelectedWorker(worker);
        setComplaintsPage(1);
        setPriorityFilter("");
        setIsModalOpen(true);
    };

    // --- Handler to open the specific complaint details ---
    const handleViewComplaintDetails = (complaint) => {
        setSelectedComplaintDetail(complaint);
        setIsComplaintDetailModalOpen(true);
    };

    const handleSummarize = async () => {
        setIsSummaryModalOpen(true);
        setIsSummarizing(true);
        setSummaryData("Generating managerial summary...");
        try {
            const { data } = await summarizeWorkerPerformance();
            setSummaryData(data.summary);
        } catch (err) {
            setSummaryData("Failed to generate summary.");
            showAlert(err.response?.data?.error || "Failed to generate summary.", "error");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleComplaintsLimitChange = (newLimit) => {
        setComplaintsLimit(newLimit);
        setComplaintsPage(1);
    };

    // Helper for status badge styling
    const getStatusBadge = (complaint) => {
        if (complaint.is_escalated && complaint.status !== "Resolved")
            return <span className={`${styles.statusBadge} ${styles.escalated}`}>Defaulted/Escalated</span>;
        if (complaint.status === "Resolved")
            return <span className={`${styles.statusBadge} ${styles.resolved}`}>Resolved</span>;
        if (complaint.status === "Worker assigned")
            return <span className={`${styles.statusBadge} ${styles.assigned}`}>Assigned</span>;
        return <span className={`${styles.statusBadge} ${styles.initiated}`}>{complaint.status}</span>;
    };

    const tableColumns = [
        { key: "name", label: "Worker Name", render: (row) => <strong>{row.name}</strong> },
        { key: "department", label: "Department" },
        { key: "current_rating", label: "Rating", render: (row) => `⭐ ${row.current_rating} (${row.rating_count})` },
        { key: "pending_count", label: "Pending", render: (row) => row.pending_count },
        {
            key: "resolved_count",
            label: "Resolved",
            render: (row) => <span style={{ color: "green", fontWeight: "bold" }}>{row.resolved_count}</span>,
        },
        {
            key: "defaulted_count",
            label: "Defaulted",
            render: (row) => (
                <span style={{ color: row.defaulted_count > 0 ? "red" : "inherit", fontWeight: "bold" }}>
                    {row.defaulted_count}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Action",
            render: (row) => (
                <Button variant="primary" onClick={() => handleViewTasks(row)} slim={true}>
                    View Tasks
                </Button>
            ),
        },
    ];

    // Columns for the worker's tasks table
    const taskColumns = [
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
        { key: "department", label: "Dept / Category", render: (row) => `${row.department} - ${row.sub_category}`},
        {
            key: "location",
            label: "Location",
            render: (row) => `Room ${row.room_no}`,
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
            render: (row) => (
                <Button variant="primary" onClick={() => handleViewComplaintDetails(row)} slim={true}>
                    View
                </Button>
            ),
        },
    ];

    return (
        <div>
            {/* Stat Cards */}
            <div className={styles.statsGrid} style={{ marginBottom: "2rem" }}>
                <div className={styles.statCard}>
                    <h3>Total Pending</h3>
                    <p>{stats.totalPending}</p>
                </div>
                <div className={`${styles.statCard} ${styles.resolved}`}>
                    <h3>Total Resolved</h3>
                    <p>{stats.totalResolved}</p>
                </div>
                <div className={`${styles.statCard} ${styles.escalated}`}>
                    <h3>Total Defaulted</h3>
                    <p>{stats.totalDefaulted}</p>
                </div>
            </div>

            {/* Header & Filter */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <h2>Worker Performance</h2>
                    <Button variant="primary" onClick={handleSummarize} disabled={isSummarizing} slim={true}>
                        ✨ AI Summarize
                    </Button>
                </div>
                <div style={{ width: "250px" }}>
                    <Select
                        name="departmentFilter"
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        slim={true}
                        options={[
                            { label: "All Departments", value: "" },
                            ...Object.keys(DEPARTMENT_SUBCATEGORIES).map((dept) => ({ label: dept, value: dept })),
                        ]}
                    />
                </div>
            </div>

            {/* Main Data Table */}
            <Table
                columns={tableColumns}
                data={performanceData}
                isLoading={isLoading}
                emptyMessage="No workers found matching the criteria."
            />

            {/* Modal for Viewing Worker Tasks in Table Form */}
            {isModalOpen && selectedWorker && (
                <Modal
                    title={`Work History: ${selectedWorker.name}`}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    maxWidth="1100px" // Increased max-width for better table viewing
                >
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                            <div style={{ width: '200px' }}>
                                <Select
                                    label="Filter by Priority"
                                    name="priorityFilter"
                                    value={priorityFilter}
                                    onChange={(e) => {
                                        setPriorityFilter(e.target.value);
                                        setComplaintsPage(1);
                                    }}
                                    slim={true}
                                    options={[
                                        { label: "All Priorities", value: "" },
                                        { label: "High", value: "High" },
                                        { label: "Medium", value: "Medium" },
                                        { label: "Low", value: "Low" },
                                    ]}
                                />
                            </div>
                        </div>
                        {/* Table View Container */}
                        <Table
                            columns={taskColumns}
                            data={workerComplaints}
                            isLoading={isFetchingComplaints}
                            emptyMessage="This worker has no assigned tasks."
                        />

                        {/* Pagination Controls */}
                        {complaintsTotalPages > 1 && (
                            <Pagination
                                currentPage={complaintsPage}
                                totalPages={complaintsTotalPages}
                                onPageChange={setComplaintsPage}
                                limit={complaintsLimit}
                                onLimitChange={handleComplaintsLimitChange}
                                totalRecords={complaintsTotalRecords}
                                isLoading={isFetchingComplaints}
                            />
                        )}

                        <div style={{ marginTop: "20px" }}></div>
                        <div className={styles.footer}>
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* NEW: Complaint Detail Modal */}
            {isComplaintDetailModalOpen && selectedComplaintDetail && (
                <ComplaintDetailModal
                    isOpen={isComplaintDetailModalOpen}
                    onClose={() => setIsComplaintDetailModalOpen(false)}
                    complaint={selectedComplaintDetail}
                    role="worker"
                />
            )}

            {/* AI Summary Modal */}
            {isSummaryModalOpen && (
                <Modal
                    title="AI Performance Summary"
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

export default WorkerPerformance;