// src/pages/Admin/HostelAnalytics.jsx
import { useState, useEffect } from "react";
import { getHostelAnalytics } from "../../api";
import { useAlert } from "../../context/AlertContext";
import { Table } from "../../components/Table/Table";
import styles from "../Student/StudentComplaints.module.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const HostelAnalytics = () => {
    const { showAlert } = useAlert();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, escalated: 0 });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setIsLoading(true);
                const response = await getHostelAnalytics();
                const fetchedData = response.data;
                setData(fetchedData);

                // Calculate total aggregated stats for the cards
                const totals = fetchedData.reduce(
                    (acc, curr) => ({
                        total: acc.total + curr.total_complaints,
                        resolved: acc.resolved + curr.resolved_complaints,
                        pending: acc.pending + curr.pending_complaints,
                        escalated: acc.escalated + curr.escalated_complaints,
                    }),
                    { total: 0, resolved: 0, pending: 0, escalated: 0 },
                );

                setStats(totals);
            } catch (error) {
                showAlert(error.response?.data?.error || error.message || "Failed to load hostel analytics.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [showAlert]);

    const columns = [
        {
            key: "hostel_name",
            label: "Hostel Name",
            render: (row) => <strong>{row.hostel_name || "Unassigned"}</strong>,
        },
        { key: "total_complaints", label: "Total Complaints" },
        { key: "pending_complaints", label: "Pending" },
        {
            key: "resolved_complaints",
            label: "Resolved",
            render: (row) => <span style={{ color: "green", fontWeight: "bold" }}>{row.resolved_complaints}</span>,
        },
        {
            key: "escalated_complaints",
            label: "Escalated/Defaulted",
            render: (row) => (
                <span style={{ color: row.escalated_complaints > 0 ? "red" : "inherit", fontWeight: "bold" }}>
                    {row.escalated_complaints}
                </span>
            ),
        },
    ];

    return (
        <div>
            {/* Stat Cards */}
            <div className={styles.statsGrid} style={{ marginBottom: "2rem" }}>
                <div className={styles.statCard}>
                    <h3>Total Complaints</h3>
                    <p>{stats.total}</p>
                </div>
                <div className={`${styles.statCard} ${styles.resolved}`}>
                    <h3>Total Resolved</h3>
                    <p>{stats.resolved}</p>
                </div>
                <div className={`${styles.statCard} ${styles.escalated}`}>
                    <h3>Total Escalated</h3>
                    <p>{stats.escalated}</p>
                </div>
            </div>

            {/* Interactive Responsive Graph */}
            <div
                style={{
                    backgroundColor: "var(--card-bg)",
                    borderRadius: "12px",
                    marginBottom: "2rem",
                }}
            >
                <h2 style={{ marginBottom: "1.5rem" }}>Hostel Performance Comparison</h2>
                <div style={{ width: "100%", height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="hostel_name" tick={{fill: 'var(--nav-border)', fontSize: 12}} tickLine={false} axisLine={false} />
                            <YAxis tick={{fill: 'var(--text-secondary)', fontSize: 12}} tickLine={false} axisLine={false} />
                            
                            {/* Updated tooltip cursor to whitish-gray (#f3f4f6) */}
                            <Tooltip 
                                cursor={{ fill: '#f3f4f6' }} 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                            
                            {/* Made bars slightly thinner by adding barSize */}
                            <Bar dataKey="resolved_complaints" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="pending_complaints" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="escalated_complaints" name="Escalated" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Main Data Table */}
            <Table
                columns={columns}
                data={data}
                isLoading={isLoading}
                emptyMessage="No hostel performance data available."
            />
        </div>
    );
};

export default HostelAnalytics;
