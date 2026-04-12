import { Button } from "../Buttons/Button"; // Adjust path if necessary
import styles from "./ComplaintCard.module.css";

const ComplaintCard = ({ complaint, getStatusBadge, onViewDetails }) => {
    if (!complaint) return null;

    return (
        <div className={styles.card}>
            {/* Card Header */}
            <div className={styles.header}>
                <h4 className={styles.title}>
                    Complaint #{complaint.complaint_no}
                </h4>
                {getStatusBadge && getStatusBadge(complaint)}
            </div>

            {/* Card Body - Grid Layout */}
            <div className={styles.detailsGrid}>
                <div>
                    <strong>Department:</strong> {complaint.department}
                </div>
                <div>
                    <strong>Category:</strong> {complaint.sub_category}
                </div>
                <div>
                    <strong>Student:</strong> {complaint.student_name}
                </div>
                <div>
                    <strong>Contact:</strong> {complaint.student_phone || "N/A"}
                </div>
                <div>
                    <strong>Location:</strong> Room {complaint.room_no}
                </div>
                <div>
                    <strong>Assigned On:</strong>{" "}
                    {complaint.assigned_at
                        ? new Date(complaint.assigned_at).toLocaleDateString()
                        : "N/A"}
                </div>
            </div>

            {/* Description Block */}
            {complaint.description && (
                <div className={styles.descriptionBlock}>
                    <strong>Issue Description:</strong> {complaint.description}
                </div>
            )}

            {/* Action Button */}
            <div className={styles.actionContainer}>
                <Button
                    variant="primary"
                    onClick={() => onViewDetails(complaint)}
                    alim={true}
                >
                    Show Details
                </Button>
            </div>
        </div>
    );
};

export default ComplaintCard;