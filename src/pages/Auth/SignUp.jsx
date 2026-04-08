import { useEffect, useState } from "react";
import { UserCircle, BadgeIcon as IdCard } from "lucide-react";
import { Link, useNavigate } from "react-router";
import styles from "./Auth.module.css";
import { useAuth } from "../../context/AuthContext";

const SignUp = () => {
    const [rollNumber, setRollNumber] = useState("");
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate("/", { replace: true });
        }
    }, [user, loading, navigate]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Activate Account</h1>
                    <p className={styles.subtitle}>Verify your hosteller status to begin.</p>
                </div>

                <form className={styles.form}>
                    <div className={styles.notice} style={{ marginTop: 0, marginBottom: "1rem" }}>
                        Your account has already been provisioned by the Junior Assistant based on the official allotment records. Please enter your Roll Number to activate your profile.
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Roll Number (Primary Key)</label>
                        <div className={styles.inputWrapper}>
                            <IdCard size={18} className={styles.inputIcon} />
                            <input 
                                type="text" 
                                className={styles.input} 
                                placeholder="e.g., 2023CS001"
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                        <UserCircle size={20} /> Verify & Activate
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Already activated? </span>
                    <Link to="/login" style={{ color: "var(--text-menu-active)", fontWeight: "600" }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;