import { useState } from "react";
import { UserCircle, BadgeIcon as IdCard } from "lucide-react";
import { onboardStudent } from "../api";
import { Link } from "react-router";
import styles from "./Auth.module.css";

const SignUp = () => {
    const [rollNumber, setRollNumber] = useState("");

    const handleOnboard = async (e) => {
        e.preventDefault();
        try {
            // Triggers the onboarding process for a student already in the DB
            const response = await onboardStudent({ rollNumber });
            console.log("Onboarding initialized", response.data);
            // Typically followed by Google OAuth verification
        } catch (error) {
            console.error("Onboarding failed", error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Activate Account</h1>
                    <p className={styles.subtitle}>Verify your hosteller status to begin.</p>
                </div>

                <form className={styles.form} onSubmit={handleOnboard}>
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