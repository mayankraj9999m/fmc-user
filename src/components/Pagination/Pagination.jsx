import { useState } from "react";
import { Button } from "../Buttons/Button"; 
import styles from "./Pagination.module.css";

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    limit,
    onLimitChange,
    totalRecords,
    isLoading = false
}) => {
    const [jumpPage, setJumpPage] = useState("");

    // Unified handler to clear the jump input whenever a page change is triggered
    const handlePageChange = (newPage) => {
        setJumpPage(""); // Clear the input
        onPageChange(newPage); // Notify the parent component
    };

    const handleLimitChange = (e) => {
        setJumpPage(""); // Clear the input when limit changes too
        onLimitChange(e);
    };

    const handleJumpSubmit = (e) => {
        e.preventDefault();
        const pageNum = parseInt(jumpPage, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            handlePageChange(pageNum);
        } else {
            setJumpPage(""); // Reset if invalid input
        }
    };

    if (totalPages <= 1 && totalRecords === 0) return null;

    return (
        <div className={styles.paginationWrapper}>
            {/* LIMIT SELECTOR */}
            <div className={styles.limitSelector}>
                <label>Rows per page: </label>
                <select 
                    value={limit} 
                    onChange={handleLimitChange} 
                    className={styles.limitSelect}
                    disabled={isLoading}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    {totalRecords > 0 && <option value={totalRecords}>All</option>}
                </select>
            </div>

            {/* PREV/NEXT BUTTONS */}
            <div className={styles.pagination}>
                <Button
                    variant="secondary"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoading}
                >
                    Previous
                </Button>
                <span style={{ fontWeight: "500", color: "var(--text-secondary)" }}>
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="secondary"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || isLoading}
                >
                    Next
                </Button>
            </div>

            {/* JUMP TO PAGE FORM */}
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
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    className={styles.jumpBtn} 
                    disabled={!jumpPage || isLoading}
                >
                    Go
                </button>
            </form>
        </div>
    );
};

export default Pagination;