import Modal from "../Modal/Modal";
import { Button } from "../Buttons/Button";
import styles from "./ComplaintDetailModal.module.css";

const ComplaintDetailModal = ({ isOpen, onClose, complaint, role = "student" }) => {
    if (!complaint) return null;

    // Helper to format dates safely
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
    };

    // Helper to generate color-coded status badges
    const getStatusBadge = (complaint) => {
        if (complaint.is_escalated)
            return <span className={`${styles.statusBadge} ${styles.escalated}`}>Escalated</span>;
        if (complaint.status === "Resolved")
            return <span className={`${styles.statusBadge} ${styles.resolved}`}>Resolved</span>;
        if (complaint.status === "Worker assigned")
            return <span className={`${styles.statusBadge} ${styles.assigned}`}>Worker Assigned</span>;
        return <span className={`${styles.statusBadge} ${styles.initiated}`}>Initiated</span>;
    };

    const thStyle = {
        textAlign: "left",
        padding: "10px 12px",
        color: "var(--th-comp-color)",
        fontWeight: "600",
        borderBottom: "1px solid var(--nav-border, #eee)",
        width: "35%",
        backgroundColor: "var(--th-comp-bg)",
    };

    const tdStyle = {
        textAlign: "left",
        padding: "10px 12px",
        color: "var(--text-title, #222)",
        fontWeight: "500",
        borderBottom: "1px solid var(--nav-border, #eee)",
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${role === "worker" ? "Task" : "Complaint"} Details #${complaint.complaint_no}`}
        >
            <div className={styles.container}>
                {/* Section 1: Meta Information (Table Structure) */}
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid var(--nav-border, #eee)",
                    }}
                >
                    <tbody>
                        <tr>
                            <th style={thStyle}>Current Status</th>
                            <td style={tdStyle}>{getStatusBadge(complaint)}</td>
                        </tr>
                        <tr>
                            <th style={thStyle}>{role === "worker" ? "Location / Dept" : "Department"}</th>
                            <td style={tdStyle}>{complaint.department}</td>
                        </tr>
                        <tr>
                            <th style={thStyle}>Sub Category</th>
                            <td style={tdStyle}>{complaint.sub_category}</td>
                        </tr>
                        <tr>
                            <th style={thStyle}>Priority Score</th>
                            <td style={tdStyle}>
                                <span style={{
                                    fontWeight: "bold",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    fontSize: "0.85rem",
                                    backgroundColor: complaint.priority_score === 'High' ? '#fee2e2' : complaint.priority_score === 'Medium' ? '#fef3c7' : '#dcfce7',
                                    color: complaint.priority_score === 'High' ? '#dc2626' : complaint.priority_score === 'Medium' ? '#d97706' : '#16a34a'
                                }}>
                                    {complaint.priority_score || "N/A"}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <th style={thStyle}>Escalated</th>
                            <td style={tdStyle}>{complaint.is_escalated ? "Yes" : "No"}</td>
                        </tr>
                        <tr>
                            <th style={thStyle}>Lodged At</th>
                            <td style={tdStyle}>{formatDate(complaint.lodged_at)}</td>
                        </tr>
                        {complaint.assigned_at && (
                            <tr>
                                <th style={thStyle}>Assigned At</th>
                                <td style={tdStyle}>{formatDate(complaint.assigned_at)}</td>
                            </tr>
                        )}
                        {complaint.status == "Resolved" && complaint.resolved_at && (
                            <tr>
                                <th style={thStyle}>Resolved on</th>
                                <td style={tdStyle}>{formatDate(complaint.resolved_at)}</td>
                            </tr>
                        )}
                        {complaint.resolution_message && (
                            <tr>
                                <th style={thStyle}>Resolution Message</th>
                                <td style={tdStyle}>{complaint.resolution_message}</td>
                            </tr>
                        )}
                        {complaint.rating && (
                            <>
                                <tr>
                                    <th style={thStyle}>Student Rating</th>
                                    <td style={tdStyle}>⭐ {complaint.rating} / 5</td>
                                </tr>
                                {complaint.feedback && (
                                    <tr>
                                        <th style={thStyle}>Student Feedback</th>
                                        <td style={tdStyle}>{complaint.feedback}</td>
                                    </tr>
                                )}
                            </>
                        )}
                        {/* Worker Details (Only show to Student if assigned) */}
                        {role === "student" && complaint.worker_name && (
                            <tr>
                                <th style={thStyle}>Assigned Worker</th>
                                <td style={tdStyle}>{`${complaint.worker_name} (${complaint.worker_phone})`}</td>
                            </tr>
                        )}
                        {role === "worker" && (
                            <tr>
                                <th style={thStyle}>Student Details</th>
                                <td style={tdStyle}>
                                    <div>
                                        <strong>
                                            {complaint.student_name} ({complaint.student_phone})
                                        </strong>
                                        <br />
                                        <small>{`${complaint.hostel_name} - Room ${complaint.room_no}`}</small>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Section 2: Description Box */}
                <div className={styles.fullWidth}>
                    <div className={styles.sectionTitle}>Issue Description</div>
                    <div className={styles.descriptionBox}>{complaint.description}</div>
                </div>

                {/* Section 3: Evidence Images */}
                {(complaint.complaint_image || complaint.resolved_image) && (
                    <div className={styles.imageGrid}>
                        {complaint.complaint_image && (
                            <div className={styles.imageContainer}>
                                <strong>
                                    {role === "worker" ? "Student's Uploaded Evidence" : "Your Uploaded Evidence"}
                                </strong>
                                <a href={complaint.complaint_image} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={complaint.complaint_image}
                                        alt="Issue Evidence"
                                        className={styles.evidenceImage}
                                    />
                                </a>
                                <span className={styles.imageHint}>Click image to view full size</span>
                            </div>
                        )}

                        {complaint.resolved_image && (
                            <div className={styles.imageContainer}>
                                <strong>
                                    {role === "worker" ? "Your Resolution Proof" : "Worker's Resolution Proof"}
                                </strong>
                                <a href={complaint.resolved_image} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={complaint.resolved_image}
                                        alt="Resolution Proof"
                                        className={styles.evidenceImage}
                                    />
                                </a>
                                <span className={styles.imageHint}>Click image to view full size</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Controls */}
                <div className={styles.footer}>
                    <Button type="button" variant="secondary" onClick={onClose} danger={true}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ComplaintDetailModal;
