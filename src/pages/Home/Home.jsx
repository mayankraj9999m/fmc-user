import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAnnouncements, createAnnouncement, summarizeAnnouncements } from "../../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./Home.module.css";
import reactLogo from "../../assets/logo.svg";
import bannerImage from "../../assets/nit_front_gate.jpg";

// UI Components
import { Button } from "../../components/Buttons/Button";
import Modal from "../../components/Modal/Modal";
import { Input, Select, FormRow, FormActions } from "../../components/FormElements/FormElements";
import { useNavigate } from "react-router";

const Home = () => {
    const { user, role, loading } = useAuth();
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState({
        Common: [],
        Hostel: [],
        Worker: [],
    });
    const [fetchingAnns, setFetchingAnns] = useState(false);

    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [summaryData, setSummaryData] = useState("");
    const [isSummarizing, setIsSummarizing] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState("All");

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: "", content: "", type: "" });
    const [submitMsg, setSubmitMsg] = useState("");

    // Determine allowed announcement types based on RBAC rules
    let allowedTypes = [];
    if (role === "admin") {
        if (user?.position === "Chief Warden" || user?.position === "Junior Assistant") {
            allowedTypes = ["Common"];
        } else if (user?.position === "Hostel Warden" || user?.position === "Associate Warden") {
            allowedTypes = ["Common", "Hostel", "Worker"];
        }
    } else if (role === "worker") {
        allowedTypes = ["Worker"];
    }

    const canAnnounce = allowedTypes.length > 0;

    // Convert allowed types to the format expected by the <Select /> component
    const typeOptions = allowedTypes.map((t) => ({ label: t, value: t }));

    const fetchAndCategorizeAnnouncements = async () => {
        setFetchingAnns(true);
        try {
            const res = await getAnnouncements();
            const data = res.data;

            // Group and get Top 10 of each type
            const grouped = {
                Common: data.filter((a) => a.type === "Common").slice(0, 10),
                Hostel: data.filter((a) => a.type === "Hostel").slice(0, 10),
                Worker: data.filter((a) => a.type === "Worker").slice(0, 10),
            };
            setAnnouncements(grouped);
        } catch (error) {
            console.error("Failed to fetch announcements:", error);
        } finally {
            setFetchingAnns(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAndCategorizeAnnouncements();
        }
    }, [user]);

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        setSubmitMsg("");
        setIsSubmitting(true);
        try {
            await createAnnouncement(formData);
            setFormData({ title: "", content: "", type: "" });
            setIsModalOpen(false); // Close modal on success
            fetchAndCategorizeAnnouncements(); // Refresh lists
        } catch (error) {
            setSubmitMsg(error.response?.data?.error || "Failed to post announcement.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSubmitMsg("");
        setFormData({ title: "", content: "", type: "" });
    };

    const handleSummarizeAnnouncements = async () => {
        setIsSummaryModalOpen(true);
        setIsSummarizing(true);
        setSummaryData("Generating critical announcement summary...");
        try {
            const { data } = await summarizeAnnouncements();
            setSummaryData(data.summary);
        } catch (err) {
            setSummaryData("Failed to generate summary.");
        } finally {
            setIsSummarizing(false);
        }
    };

    if (loading) return <div className={styles.loader}>Loading...</div>;

    // ==========================================
    // NOT LOGGED IN: GUEST VIEW
    // ==========================================
    if (!user) {
        return (
            <div 
                className={styles.guestContainer}
                style={{
                    backgroundImage: `linear-gradient(rgba(6, 108, 185, 0.6), rgba(5, 57, 125, 0.7)), url(${bannerImage})`
                }}
            >
                <div className={styles.heroCard}>
                    <img src={reactLogo} alt="NIT Delhi Logo" className={styles.logo} />
                    <h1 className={styles.title}>Fix My Campus</h1>
                    <p className={styles.subtitle}>
                        National Institute of Technology Delhi's AI-Enabled Hostel Complaint Resolution System
                    </p>
                    <div className={styles.actionButtons}>
                        <Button variant="primary" onClick={() => navigate('/login')}>
                            Login
                        </Button>
                        <Button variant="secondary" onClick={() => navigate('/signup')}>
                            Sign Up
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // LOGGED IN: USER DASHBOARD
    // ==========================================

    const getDisplayedAnnouncements = () => {
        if (activeTab === "All") {
            const combined = [...announcements.Common, ...announcements.Hostel, ...announcements.Worker];
            return combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return announcements[activeTab] || [];
    };

    const displayedAnnouncements = getDisplayedAnnouncements();
    const tabs = ["All", "Common", "Hostel", "Worker"];

    return (
        <div className={styles.dashboardContainer}>
            <div
                className={styles.banner}
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${bannerImage})`,
                }}
            >
                <div className={styles.bannerContent}>
                    <h1>FixMyCampus Portal</h1>
                    <p>National Institute of Technology Delhi</p>
                </div>
            </div>
            {/* User Profile Header */}
            {/* <div className={styles.profileHeader}>
                <div className={styles.avatar}>
                    {user.profile_picture ? (
                        <img src={user.profile_picture} alt="Profile" />
                    ) : (
                        <span>{user.name?.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <div className={styles.userInfo}>
                    <h2>Welcome back, {user.name}</h2>
                    <p className={styles.roleBadge}>
                        {role.toUpperCase()} {user.position ? `| ${user.position}` : ""}
                        {user.hostel_name ? ` | ${user.hostel_name}` : ""}
                    </p>
                </div>
            </div> */}

            {/* Announcements Panel */}
            <div className={styles.announcementPanel}>
                <div className={styles.panelHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h2>Latest Announcements</h2>
                        <Button variant="primary" onClick={handleSummarizeAnnouncements} disabled={isSummarizing} slim={true}>
                            ✨ AI Summarize
                        </Button>
                    </div>
                    {canAnnounce && (
                        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} slim>
                            New Announcement
                        </Button>
                    )}
                </div>

                {/* Tab Menu */}
                <div className={styles.tabMenu}>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTabBtn : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {fetchingAnns ? (
                    <p>Loading announcements...</p>
                ) : (
                    <div className={styles.scrollableList}>
                        {displayedAnnouncements.length > 0 ? (
                            displayedAnnouncements.map((a) => (
                                <div key={a.id} className={styles.announcementCard}>
                                    <div className={styles.cardHeader}>
                                        <h5>{a.title}</h5>
                                        {activeTab === "All" && <span className={styles.typeBadge}>{a.type}</span>}
                                    </div>
                                    <p className={styles.annContent}>{a.content}</p>
                                    <div className={styles.annMeta}>
                                        <span>By: {a.author_name || "Admin"}</span>
                                        <span>{new Date(a.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={styles.noAnnouncements}>
                                No recent {activeTab.toLowerCase()} announcements found.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Create Announcement Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Post an Announcement">
                <form onSubmit={handleCreateAnnouncement}>
                    <FormRow>
                        <Input
                            label="Announcement Title"
                            placeholder="Enter a clear, concise title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </FormRow>

                    {/* Simulating your FormElements structure for a Textarea */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Content</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Type the announcement details here..."
                            required
                            rows="4"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    <FormRow>
                        <Select
                            label="Audience / Type"
                            required
                            options={typeOptions}
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                    </FormRow>

                    {submitMsg && <p className={styles.errorMsg}>{submitMsg}</p>}

                    <FormActions>
                        <Button type="submit" variant="primary" isLoading={isSubmitting}>
                            Publish Announcement
                        </Button>
                    </FormActions>
                </form>
            </Modal>

            {/* AI Summary Modal */}
            {isSummaryModalOpen && (
                <Modal
                    title="AI Announcement Summary"
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

export default Home;
