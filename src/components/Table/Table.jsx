import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import styles from "./Table.module.css";

export const Table = ({
    columns,
    data = [],
    isLoading = false,
    emptyMessage = "No records found.",
    loadingMessage = "Loading records...",

    // Sorting Props
    sortBy,
    sortOrder,
    onSort,

    // Selection Props
    selectable = false,
    selectedIds = [],
    onSelectAll,
    onSelectOne,
    idKey = "id", // The key in your data used for unique identification
}) => {
    // Check if all rows are selected (for the "Select All" checkbox)
    const isAllSelected = data.length > 0 && selectedIds.length === data.length;

    return (
        <div className={styles.tableResponsive}>
            <table className={styles.table} style={isLoading ? { minWidth: "0px" } : undefined}>
                <thead>
                    {isLoading ? (
                        <tr>
                            <th>Fetching...</th>
                        </tr>
                    ) : (
                        <tr>
                            {/* Select All Checkbox */}
                            {selectable && (
                                <th className={styles.checkboxCell}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={isAllSelected}
                                        onChange={onSelectAll}
                                    />
                                </th>
                            )}

                            {/* Dynamic Headers */}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => col.sortable && onSort && onSort(col.key)}
                                    className={col.sortable ? styles.sortableHeader : ""}
                                >
                                    <div className={styles.headerContent}>
                                        {col.label}
                                        {col.sortable &&
                                            sortBy === col.key &&
                                            (sortOrder === "ASC" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    )}
                </thead>
                <tbody>
                    {/* Loading State */}
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length + (selectable ? 1 : 0)} className={styles.stateCell}>
                                <div className={styles.loadingContainer}>
                                    <Loader2 size={32} className={styles.spin} color="var(--text-menu-active)" />
                                    <span>{loadingMessage}</span>
                                </div>
                            </td>
                        </tr>
                    ) : /* Empty State */
                    data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + (selectable ? 1 : 0)} className={styles.stateCell}>
                                <p className={styles.empty}>{emptyMessage}</p>
                            </td>
                        </tr>
                    ) : (
                        /* Data Rows */
                        data.map((row, rowIndex) => (
                            <tr key={row[idKey] || rowIndex}>
                                {/* Row Checkbox */}
                                {selectable && (
                                    <td className={styles.checkboxCell}>
                                        <input
                                            type="checkbox"
                                            className={styles.checkbox}
                                            checked={selectedIds.includes(row[idKey])}
                                            onChange={() => onSelectOne(row[idKey])}
                                        />
                                    </td>
                                )}

                                {/* Data Cells */}
                                {columns.map((col) => (
                                    <td key={col.key}>
                                        {/* If a custom render function is provided, use it, else render raw data */}
                                        {col.render ? col.render(row, rowIndex) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
