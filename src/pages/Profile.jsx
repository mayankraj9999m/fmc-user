import { useEffect, useState } from "react";
import { getProfile, logoutUser } from "../api";
import { navigate } from "../router/navigate";
import styles from "./Profile.module.css";
import { 
    LogOut, User, MapPin, Briefcase, Star, Phone, Mail, 
    Calendar, Hash, Layers 
} from "lucide-react";
import LoadingScreen from "./LoadingScreen";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await getProfile();
                setUser(data.user);
                setRole(data.role);
                // Sync local storage just in case
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("role", data.role);
            } catch (err) {
                console.error(err);
                setError("Session expired or invalid. Please login again.");
                if(err.response?.status === 401) {
                    localStorage.removeItem("user");
                    localStorage.removeItem("role");
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
            localStorage.clear();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (loading) {
        return <LoadingScreen message="Getting your profile..." />;
    }
    if (error) return <div className={styles.centerMsgError}>{error}</div>;
    if (!user) return <div className={styles.centerMsg}>No user found.</div>;

    // Helper to format dates
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.avatar}>
                        <img 
                            src={user.profile_picture || user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                            alt="Profile" 
                        />
                    </div>
                    <h1 className={styles.name}>{user.name}</h1>
                    <span className={`${styles.badge} ${styles[role]}`}>{role.toUpperCase()}</span>
                    <p className={styles.joined}>Joined: {formatDate(user.created_at)}</p>
                </div>

                <div className={styles.divider}></div>

                {/* Details Grid */}
                <div className={styles.detailsGrid}>
                    <InfoItem icon={Mail} label="Email Address" value={user.email} fullWidth />

                    {/* --- STUDENT FIELDS --- */}
                    {role === "student" && (
                        <>
                            <InfoItem icon={MapPin} label="Hostel" value={user.hostel_name} />
                            <InfoItem icon={Hash} label="Room Number" value={user.room_no} />
                            <InfoItem icon={Layers} label="Floor" value={user.floor_no} />
                            <InfoItem icon={Phone} label="Phone" value={user.phone_number} />
                        </>
                    )}

                    {/* --- ADMIN FIELDS --- */}
                    {role === "admin" && (
                        <>
                            <InfoItem icon={Briefcase} label="Position" value={user.position} />
                            <InfoItem icon={MapPin} label="Managed Hostel" value={user.hostel_name} />
                            <InfoItem icon={Phone} label="Contact" value={user.phone} />
                            <InfoItem icon={User} label="Admin ID" value={`ADM-${user.id}`} />
                        </>
                    )}

                    {/* --- WORKER FIELDS --- */}
                    {role === "worker" && (
                        <>
                            <InfoItem icon={Briefcase} label="Department" value={user.department} />
                            <InfoItem icon={Layers} label="Category" value={user.sub_work_category} />
                            <InfoItem icon={MapPin} label="Assigned Hostel" value={user.hostel_name} />
                            <InfoItem icon={Phone} label="Contact" value={user.phone_no} />
                            <InfoItem icon={Star} label="Rating" value={`${user.current_rating || 5.0} / 5.0 (${user.rating_count} reviews)`} fullWidth />
                        </>
                    )}
                </div>

                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={18} /> Logout
                </button>
            </div>
            <div className={styles.bgDecoration}></div>
        </div>
    );
};

const InfoItem = ({ icon, label, value, fullWidth }) => (
    <div className={`${styles.infoItem} ${fullWidth ? styles.fullWidth : ''}`}>
        <div className={styles.iconBox}>
            {icon && icon({ size: 20 })}
        </div>
        <div className={styles.infoText}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>{value || "Not Provided"}</span>
        </div>
    </div>
);

export default Profile;